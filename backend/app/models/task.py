from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.board import Board
    from app.models.column import Column
    from app.models.user import User


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    # ── location ──────────────────────────────────────────────────────────────

    board_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("boards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    column_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("columns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ── core fields ───────────────────────────────────────────────────────────

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # ── status & priority ─────────────────────────────────────────────────────
    # Значения: todo | in_progress | in_review | done
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="todo",
        index=True,
    )
    # Значения: low | medium | high | urgent
    priority: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="medium",
    )

    # ── dates ─────────────────────────────────────────────────────────────────

    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ── time tracking ─────────────────────────────────────────────────────────

    # Суммарное время в секундах — денормализация для быстрой аналитики.
    # Пересчитывается при завершении каждой TimeEntry.
    tracked_time_total: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )
    pomodoro_sessions_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # ── recurring (Pro/Team) ──────────────────────────────────────────────────
    # Хранит правило повторения: {"frequency": "weekly", "interval": 1, "ends_at": null}
    # null — задача не повторяется
    recurring_rule: Mapped[Optional[dict]] = mapped_column(
        JSONB,
        nullable=True,
    )

    # ── flags ─────────────────────────────────────────────────────────────────

    is_archived: Mapped[bool] = mapped_column(
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

    board: Mapped[Board] = relationship(
        "Board",
        foreign_keys=[board_id],
        lazy="selectin",
    )
    column: Mapped[Column] = relationship(
        "Column",
        foreign_keys=[column_id],
        lazy="selectin",
    )
    creator: Mapped[Optional[User]] = relationship(
        "User",
        foreign_keys=[created_by],
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title!r} status={self.status!r}>"
