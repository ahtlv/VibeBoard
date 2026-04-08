from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.workspace import Workspace


class Subscription(Base):
    __tablename__ = "subscriptions"
    __table_args__ = (
        # Один пользователь — одна активная подписка
        UniqueConstraint("user_id", name="uq_subscriptions_user"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ── ownership ─────────────────────────────────────────────────────────────

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Заполняется только для Team-плана
    workspace_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── plan & status ─────────────────────────────────────────────────────────
    # plan:   free | pro | team
    # status: active | trialing | past_due | canceled | unpaid
    plan: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="free",
    )
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
    )

    # ── stripe identifiers ────────────────────────────────────────────────────
    # Отсутствуют для free-плана (нет Stripe-объектов)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        unique=True,
    )

    # ── billing period ────────────────────────────────────────────────────────
    current_period_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    current_period_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    cancel_at_period_end: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    # ── timestamps ────────────────────────────────────────────────────────────

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # ── relationships ─────────────────────────────────────────────────────────

    user: Mapped[User] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="selectin",
    )
    workspace: Mapped[Optional[Workspace]] = relationship(
        "Workspace",
        foreign_keys=[workspace_id],
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Subscription user={self.user_id} plan={self.plan!r} status={self.status!r}>"
