from __future__ import annotations

from typing import Optional

import stripe

from app.core.config import settings

_PRICE_TO_PLAN: dict[str, str] = {}


def _build_price_map() -> dict[str, str]:
    """Строим price_id → plan name из конфига (лениво, чтобы не читать settings на импорте)."""
    mapping: dict[str, str] = {}
    if settings.STRIPE_PRICE_ID_PRO:
        mapping[settings.STRIPE_PRICE_ID_PRO] = "pro"
    if settings.STRIPE_PRICE_ID_TEAM:
        mapping[settings.STRIPE_PRICE_ID_TEAM] = "team"
    return mapping


def price_id_to_plan(price_id: str) -> Optional[str]:
    """Возвращает имя плана по price_id или None если неизвестен."""
    global _PRICE_TO_PLAN
    if not _PRICE_TO_PLAN:
        _PRICE_TO_PLAN = _build_price_map()
    return _PRICE_TO_PLAN.get(price_id)


def verify_and_parse_event(payload: bytes, sig_header: str) -> stripe.Event:
    """Верифицирует подпись Stripe и парсит Event.

    Raises:
        stripe.SignatureVerificationError: подпись не валидна.
        ValueError: webhook secret не настроен.
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise ValueError("STRIPE_WEBHOOK_SECRET is not configured")
    return stripe.Webhook.construct_event(
        payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
    )


async def get_stripe_subscription(subscription_id: str) -> stripe.Subscription:
    client = stripe.AsyncStripeClient(api_key=settings.STRIPE_SECRET_KEY)
    return await client.subscriptions.retrieve(subscription_id)


async def create_checkout_session(
    *,
    price_id: str,
    success_url: str,
    cancel_url: str,
    customer_id: Optional[str] = None,
    customer_email: Optional[str] = None,
    client_reference_id: str,
) -> stripe.checkout.Session:
    """Создаёт Stripe Checkout Session для подписки.

    Передаёт либо существующий customer_id, либо customer_email —
    Stripe сам создаст Customer при первом checkout.
    """
    params: stripe.checkout.SessionCreateParams = {
        "mode": "subscription",
        "line_items": [{"price": price_id, "quantity": 1}],
        "success_url": success_url,
        "cancel_url": cancel_url,
        "client_reference_id": client_reference_id,
    }

    if customer_id:
        params["customer"] = customer_id
    elif customer_email:
        params["customer_email"] = customer_email

    client = stripe.AsyncStripeClient(api_key=settings.STRIPE_SECRET_KEY)
    return await client.checkout.sessions.create(params)
