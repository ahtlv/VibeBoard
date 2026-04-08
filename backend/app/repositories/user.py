from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        result = await self._db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self._db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        email: str,
        password_hash: Optional[str],
        name: str,
    ) -> User:
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            name=name,
        )
        self._db.add(user)
        await self._db.flush()   # получаем id без commit — транзакция управляется сервисом
        await self._db.refresh(user)
        return user
