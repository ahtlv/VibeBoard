from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


class EmailAlreadyTakenError(Exception):
    """Email уже занят другим пользователем."""


class InvalidCredentialsError(Exception):
    """Неверный email или пароль — единое сообщение, без деталей."""


@dataclass
class LoginResult:
    user: User
    access_token: str
    expires_in: int  # секунды


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._users = UserRepository(db)

    async def register(self, data: RegisterRequest) -> User:
        """Создаёт нового пользователя.

        Raises:
            EmailAlreadyTakenError: если email уже зарегистрирован.
        """
        existing = await self._users.get_by_email(data.email)
        if existing is not None:
            raise EmailAlreadyTakenError(data.email)

        user = await self._users.create(
            email=data.email,
            password_hash=hash_password(data.password),
            name=data.name,
        )
        await self._db.commit()
        return user

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

        expires_in = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        token = create_access_token(str(user.id))
        return LoginResult(user=user, access_token=token, expires_in=expires_in)
