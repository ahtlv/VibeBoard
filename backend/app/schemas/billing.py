from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel


class SubscriptionResponse(BaseModel):
    id: UUID
    plan: str
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    workspace_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CheckoutSessionRequest(BaseModel):
    plan: Literal["pro", "team"]


class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str
