from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.task import Task
    from app.models.user import User


class TimeEntry(Base):
    __tablename__ = "time_entries"

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
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    ended_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,   # None пока сессия активна
    )
    # Вычисляется сервером при завершении: ended_at - started_at.
    # None пока сессия не завершена.
    duration_seconds: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    # Жизненный цикл: active | completed | cancelled
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        index=True,
    )
    # Источник записи: manual | pomodoro | tracker
    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="tracker",
    )
    note: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # ── relationships ─────────────────────────────────────────────────────────

    task: Mapped[Task] = relationship(
        "Task",
        foreign_keys=[task_id],
        lazy="selectin",
    )
    user: Mapped[User] = relationship(
        "User",
        foreign_keys=[user_id],
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<TimeEntry id={self.id} task={self.task_id} status={self.status!r}>"
