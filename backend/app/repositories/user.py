from __future__ import annotations

import uuid
from datetime import datetime
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

    async def get_by_verification_token_hash(self, token_hash: str) -> Optional[User]:
        result = await self._db.execute(
            select(User).where(User.email_verification_token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        email: str,
        password_hash: Optional[str],
        name: str,
        email_verification_token_hash: Optional[str] = None,
        email_verification_sent_at: Optional[datetime] = None,
    ) -> User:
        user = User(
            email=email.lower(),
            password_hash=password_hash,
            name=name,
            email_verification_token_hash=email_verification_token_hash,
            email_verification_sent_at=email_verification_sent_at,
        )
        self._db.add(user)
        await self._db.flush()   # получаем id без commit — транзакция управляется сервисом
        await self._db.refresh(user)
        return user
