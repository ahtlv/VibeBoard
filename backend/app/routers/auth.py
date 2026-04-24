from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db
from app.core.config import settings
from app.integrations.email_client import EmailDeliveryNotConfiguredError
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RegisterPendingResponse,
    RegisterRequest,
    UserResponse,
    VerifyEmailResponse,
)
from app.services.auth import (
    AuthService,
    EmailAlreadyTakenError,
    EmailNotVerifiedError,
    InvalidCredentialsError,
    InvalidVerificationTokenError,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterPendingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterPendingResponse:
    service = AuthService(db)
    try:
        result = await service.register(body)
    except EmailAlreadyTakenError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )
    except EmailDeliveryNotConfiguredError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email delivery is not configured.",
        )

    return RegisterPendingResponse(
        email=result.user.email,
        message="Registration successful. Please check your email to confirm your account.",
        dev_verification_url=result.verification_url if settings.APP_ENV != "production" and not settings.SMTP_HOST else None,
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> LoginResponse:
    service = AuthService(db)
    try:
        result = await service.login(body)
    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    except EmailNotVerifiedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please confirm your email before signing in.",
        )

    return LoginResponse(
        access_token=result.access_token,
        expires_in=result.expires_in,
        user=UserResponse.from_orm_user(result.user),
    )


@router.get("/verify-email", response_model=VerifyEmailResponse)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
) -> VerifyEmailResponse:
    service = AuthService(db)
    try:
        result = await service.verify_email(token)
    except InvalidVerificationTokenError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification link is invalid or expired.",
        )

    return VerifyEmailResponse(
        access_token=result.access_token,
        expires_in=result.expires_in,
        user=UserResponse.from_orm_user(result.user),
    )
