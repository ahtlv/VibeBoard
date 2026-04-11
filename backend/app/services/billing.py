from __future__ import annotations

import uuid
from datetime import datetime, timezone

import stripe
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.integrations import stripe_client
from app.models.subscription import Subscription
from app.models.user import User
from app.repositories.billing import BillingRepository
from app.schemas.billing import CheckoutSessionResponse


class SubscriptionNotFoundError(Exception):
    pass


class InvalidPlanError(Exception):
    pass


class StripeNotConfiguredError(Exception):
    pass


_PLAN_PRICE_IDS: dict[str, str] = {
    "pro": "STRIPE_PRICE_ID_PRO",
    "team": "STRIPE_PRICE_ID_TEAM",
}


class BillingService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = BillingRepository(db)

    async def get_subscription(self, user_id: uuid.UUID) -> Subscription:
        subscription = await self._repo.get_by_user_id(user_id)
        if subscription is None:
            raise SubscriptionNotFoundError(user_id)
        return subscription

    async def create_checkout_session(
        self, user: User, plan: str
    ) -> CheckoutSessionResponse:
        # Проверяем, что Stripe настроен
        price_attr = _PLAN_PRICE_IDS.get(plan)
        if price_attr is None:
            raise InvalidPlanError(plan)

        price_id: str = getattr(settings, price_attr, "")
        if not settings.STRIPE_SECRET_KEY or not price_id:
            raise StripeNotConfiguredError

        # Берём stripe_customer_id из подписки пользователя (если есть)
        subscription = await self._repo.get_by_user_id(user.id)
        stripe_customer_id = subscription.stripe_customer_id if subscription else None

        success_url = f"{settings.FRONTEND_URL}/billing?checkout=success"
        cancel_url = f"{settings.FRONTEND_URL}/billing?checkout=canceled"

        try:
            session = await stripe_client.create_checkout_session(
                price_id=price_id,
                success_url=success_url,
                cancel_url=cancel_url,
                customer_id=stripe_customer_id,
                customer_email=user.email if not stripe_customer_id else None,
                client_reference_id=str(user.id),
            )
        except stripe.StripeError as exc:
            raise RuntimeError(f"Stripe error: {exc}") from exc

        return CheckoutSessionResponse(
            session_id=session.id,
            checkout_url=session.url,
        )

    # ── webhook ───────────────────────────────────────────────────────────────

    async def handle_webhook_event(self, event: stripe.Event) -> None:
        """Диспетчер webhook-событий. Неизвестные типы игнорируются."""
        handlers = {
            "checkout.session.completed": self._on_checkout_completed,
            "customer.subscription.updated": self._on_subscription_updated,
            "customer.subscription.deleted": self._on_subscription_deleted,
        }
        handler = handlers.get(event.type)
        if handler:
            await handler(event.data.object)

    async def _on_checkout_completed(self, session: stripe.checkout.Session) -> None:
        """Checkout завершён — активируем подписку.

        Используем client_reference_id (наш user_id), чтобы найти запись.
        Дозапрашиваем Stripe Subscription для получения плана и периода.
        """
        if not session.subscription or not session.client_reference_id:
            return

        try:
            user_id = uuid.UUID(session.client_reference_id)
        except ValueError:
            return

        sub = await self._repo.get_by_user_id(user_id)
        if sub is None:
            return

        stripe_sub = await stripe_client.get_stripe_subscription(str(session.subscription))
        plan, period_start, period_end, cancel_at = _extract_subscription_fields(stripe_sub)

        await self._repo.apply_stripe_subscription(
            subscription=sub,
            plan=plan,
            status=stripe_sub.status,
            stripe_customer_id=str(session.customer),
            stripe_subscription_id=stripe_sub.id,
            current_period_start=period_start,
            current_period_end=period_end,
            cancel_at_period_end=cancel_at,
        )
        await self._db.commit()

    async def _on_subscription_updated(self, stripe_sub: stripe.Subscription) -> None:
        """Подписка изменена — синхронизируем план, статус и период."""
        sub = await self._repo.get_by_stripe_customer_id(str(stripe_sub.customer))
        if sub is None:
            return

        plan, period_start, period_end, cancel_at = _extract_subscription_fields(stripe_sub)

        await self._repo.apply_stripe_subscription(
            subscription=sub,
            plan=plan,
            status=stripe_sub.status,
            stripe_customer_id=str(stripe_sub.customer),
            stripe_subscription_id=stripe_sub.id,
            current_period_start=period_start,
            current_period_end=period_end,
            cancel_at_period_end=cancel_at,
        )
        await self._db.commit()

    async def _on_subscription_deleted(self, stripe_sub: stripe.Subscription) -> None:
        """Подписка отменена — переводим пользователя на free."""
        sub = await self._repo.get_by_stripe_customer_id(str(stripe_sub.customer))
        if sub is None:
            return

        await self._repo.cancel_stripe_subscription(sub)
        await self._db.commit()


def _extract_subscription_fields(
    stripe_sub: stripe.Subscription,
) -> tuple[str, datetime | None, datetime | None, bool]:
    """Извлекает plan, period_start, period_end, cancel_at_period_end из Stripe Subscription."""
    # Определяем plan по первому price_id
    plan = "free"
    if stripe_sub.items and stripe_sub.items.data:
        price_id = stripe_sub.items.data[0].price.id
        plan = stripe_client.price_id_to_plan(price_id) or "free"

    def _ts(ts: int | None) -> datetime | None:
        return datetime.fromtimestamp(ts, tz=timezone.utc) if ts else None

    period_start = _ts(stripe_sub.current_period_start)
    period_end = _ts(stripe_sub.current_period_end)
    cancel_at = bool(stripe_sub.cancel_at_period_end)

    return plan, period_start, period_end, cancel_at
