from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import secrets

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.integrations.email_client import EmailDeliveryNotConfiguredError, send_email_verification_link
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class EmailAlreadyTakenError(Exception):
    """Email уже занят другим пользователем."""


class InvalidCredentialsError(Exception):
    """Неверный email или пароль — единое сообщение, без деталей."""


class EmailNotVerifiedError(Exception):
    """Пользователь ещё не подтвердил email."""


class InvalidVerificationTokenError(Exception):
    """Токен подтверждения отсутствует, не найден или истёк."""


@dataclass
class RegisterResult:
    user: User
    verification_url: str


@dataclass
class LoginResult:
    user: User
    access_token: str
    expires_in: int  # секунды


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._users = UserRepository(db)

    async def register(self, data: RegisterRequest) -> RegisterResult:
        """Создаёт нового пользователя.

        Raises:
            EmailAlreadyTakenError: если email уже зарегистрирован.
        """
        existing = await self._users.get_by_email(data.email)
        if existing is not None:
            raise EmailAlreadyTakenError(data.email)

        name = data.name or data.email.split("@")[0]
        verification_token = secrets.token_urlsafe(32)
        now = datetime.now(timezone.utc)
        user = await self._users.create(
            email=data.email,
            password_hash=hash_password(data.password),
            name=name,
            email_verification_token_hash=_hash_token(verification_token),
            email_verification_sent_at=now,
        )
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        send_email_verification_link(
            to_email=user.email,
            name=user.name,
            verify_url=verify_url,
        )
        await self._db.commit()
        return RegisterResult(user=user, verification_url=verify_url)

    async def login(self, data: LoginRequest) -> LoginResult:
        """Проверяет email и пароль, возвращает токен и пользователя.

        Raises:
            InvalidCredentialsError: при несуществующем email или неверном пароле.
        """
        user = await self._users.get_by_email(data.email)

        # Намеренно не различаем «email не найден» и «пароль неверен»
        if user is None or not user.password_hash:
            raise InvalidCredentialsError
        if not verify_password(data.password, user.password_hash):
            raise InvalidCredentialsError

        if not user.is_active:
            raise InvalidCredentialsError

        if user.email_verified_at is None:
            raise EmailNotVerifiedError

        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        token = create_access_token(str(user.id))
        return LoginResult(user=user, access_token=token, expires_in=expires_in)

    async def verify_email(self, token: str) -> LoginResult:
        token_hash = _hash_token(token)
        user = await self._users.get_by_verification_token_hash(token_hash)
        if user is None or user.email_verification_sent_at is None:
            raise InvalidVerificationTokenError

        sent_at = user.email_verification_sent_at
        if sent_at.tzinfo is None:
            sent_at = sent_at.replace(tzinfo=timezone.utc)
        expires_at = sent_at + timedelta(hours=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE_HOURS)
        if datetime.now(timezone.utc) > expires_at:
            raise InvalidVerificationTokenError

        user.email_verified_at = datetime.now(timezone.utc)
        user.email_verification_token_hash = None
        user.email_verification_sent_at = None
        await self._db.commit()
        await self._db.refresh(user)

        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        return LoginResult(
            user=user,
            access_token=create_access_token(str(user.id)),
            expires_in=expires_in,
        )


def _hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()
