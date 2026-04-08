from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.workspace import Workspace


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"
    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_workspace_members_workspace_user"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # owner | admin | member
    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="member",
    )
    joined_at: Mapped[datetime] = mapped_column(
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
    user: Mapped[User] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<WorkspaceMember workspace={self.workspace_id} user={self.user_id} role={self.role!r}>"
