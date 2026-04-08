from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.task import Task


class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    task_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    text: Mapped[str] = mapped_column(
        String(1000),
        nullable=False,
    )
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

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

    task: Mapped[Task] = relationship(
        "Task",
        foreign_keys=[task_id],
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<ChecklistItem id={self.id} task={self.task_id} pos={self.position}>"
