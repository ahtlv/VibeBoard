from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_db
from app.core.security import create_access_token
from app.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserResponse
from app.services.auth import AuthService, EmailAlreadyTakenError, InvalidCredentialsError

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    service = AuthService(db)
    try:
        user = await service.register(body)
    except EmailAlreadyTakenError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    return RegisterResponse(
        access_token=create_access_token(str(user.id)),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.from_orm_user(user),
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

    return LoginResponse(
        access_token=result.access_token,
        expires_in=result.expires_in,
        user=UserResponse.from_orm_user(result.user),
    )
