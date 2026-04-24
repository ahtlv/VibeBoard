from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user import UserRepository

_bearer = HTTPBearer(auto_error=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — открывает сессию и закрывает её после запроса."""
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Извлекает JWT из Authorization: Bearer <token>, декодирует и загружает User из БД.

    Raises:
        401 Unauthorized: токен отсутствует, невалиден, истёк или пользователь не найден.
    """
    _401 = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise _401

    try:
        user_id = decode_access_token(credentials.credentials)
    except JWTError:
        raise _401

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise _401

    user = await UserRepository(db).get_by_id(uid)
    if user is None or not user.is_active or user.email_verified_at is None:
        raise _401

    return user
