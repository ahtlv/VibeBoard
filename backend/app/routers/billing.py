import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.integrations.stripe_client import verify_and_parse_event
from app.models.user import User
from app.schemas.billing import CheckoutSessionRequest, CheckoutSessionResponse, SubscriptionResponse
from app.services.billing import (
    BillingService,
    InvalidPlanError,
    StripeNotConfiguredError,
    SubscriptionNotFoundError,
)

router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SubscriptionResponse:
    try:
        subscription = await BillingService(db).get_subscription(current_user.id)
    except SubscriptionNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Subscription not found")
    return SubscriptionResponse.model_validate(subscription)


@router.post(
    "/checkout-session",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_checkout_session(
    body: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckoutSessionResponse:
    try:
        return await BillingService(db).create_checkout_session(current_user, body.plan)
    except InvalidPlanError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid plan")
    except StripeNotConfiguredError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Billing not configured")
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc))


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    stripe_signature: str = Header(alias="stripe-signature", default=""),
) -> dict:
    """Принимает Stripe webhook, верифицирует подпись и обновляет статус подписки.

    Не использует get_current_user — авторизация через HMAC-подпись Stripe.
    Возвращает 200 для любого обработанного или неизвестного события,
    чтобы Stripe не делал повторных попыток на ожидаемые типы.
    """
    payload = await request.body()

    try:
        event = verify_and_parse_event(payload, stripe_signature)
    except stripe.SignatureVerificationError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid Stripe signature")
    except ValueError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Webhook not configured")

    await BillingService(db).handle_webhook_event(event)
    return {"received": True}
