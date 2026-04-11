from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.workspace import Workspace


class Invitation(Base):
    __tablename__ = "invitations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ── workspace & sender ────────────────────────────────────────────────────

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    invited_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── invitee ───────────────────────────────────────────────────────────────

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
    )
    # Роль, которая будет присвоена при принятии: member | admin
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="member",
    )

    # ── acceptance token ──────────────────────────────────────────────────────

    # Случайный URL-safe токен для ссылки принятия приглашения
    token: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
        unique=True,
        index=True,
    )

    # ── lifecycle ─────────────────────────────────────────────────────────────
    # pending | accepted | expired | canceled
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        index=True,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ── relationships ─────────────────────────────────────────────────────────

    workspace: Mapped[Workspace] = relationship(
        "Workspace",
        foreign_keys=[workspace_id],
        lazy="selectin",
    )
    sender: Mapped[Optional[User]] = relationship(
        "User",
        foreign_keys=[invited_by],
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Invitation workspace={self.workspace_id} "
            f"email={self.email!r} role={self.role!r} status={self.status!r}>"
        )
