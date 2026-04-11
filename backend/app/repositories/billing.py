from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.subscription import Subscription
from app.models.user import User


class BillingRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_user_id(self, user_id: uuid.UUID) -> Optional[Subscription]:
        result = await self._db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_stripe_customer_id(self, customer_id: str) -> Optional[Subscription]:
        result = await self._db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        return result.scalar_one_or_none()

    async def apply_stripe_subscription(
        self,
        *,
        subscription: Subscription,
        plan: str,
        status: str,
        stripe_customer_id: str,
        stripe_subscription_id: str,
        current_period_start: Optional[datetime],
        current_period_end: Optional[datetime],
        cancel_at_period_end: bool,
    ) -> None:
        """Обновляет Subscription и денормализованный User.plan в одной транзакции."""
        subscription.plan = plan
        subscription.status = status
        subscription.stripe_customer_id = stripe_customer_id
        subscription.stripe_subscription_id = stripe_subscription_id
        subscription.current_period_start = current_period_start
        subscription.current_period_end = current_period_end
        subscription.cancel_at_period_end = cancel_at_period_end

        # Синхронизируем денормализованный plan на User
        await self._db.execute(
            update(User)
            .where(User.id == subscription.user_id)
            .values(plan=plan)
        )
        await self._db.flush()

    async def cancel_stripe_subscription(self, subscription: Subscription) -> None:
        """Помечает подписку как canceled и возвращает пользователя на free план."""
        subscription.status = "canceled"
        subscription.plan = "free"
        subscription.cancel_at_period_end = False

        await self._db.execute(
            update(User)
            .where(User.id == subscription.user_id)
            .values(plan="free")
        )
        await self._db.flush()
