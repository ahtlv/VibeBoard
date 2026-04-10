from __future__ import annotations

import uuid
from datetime import date, datetime, timezone

from sqlalchemy import cast, Date, distinct, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.time_entry import TimeEntry


class AnalyticsRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def completed_tasks_count(self, user_id: uuid.UUID) -> int:
        result = await self._db.execute(
            select(func.count()).where(
                Task.created_by == user_id,
                Task.status == "done",
                Task.is_archived.is_(False),
            )
        )
        return result.scalar_one()

    async def total_tracked_time(self, user_id: uuid.UUID) -> int:
        """Суммарное время в секундах из завершённых записей."""
        result = await self._db.execute(
            select(func.coalesce(func.sum(TimeEntry.duration_seconds), 0)).where(
                TimeEntry.user_id == user_id,
                TimeEntry.status == "completed",
            )
        )
        return result.scalar_one()

    async def active_days(self, user_id: uuid.UUID) -> list[date]:
        """Список уникальных дат, когда у пользователя были завершённые сессии."""
        result = await self._db.execute(
            select(distinct(cast(TimeEntry.started_at, Date)))
            .where(
                TimeEntry.user_id == user_id,
                TimeEntry.status == "completed",
            )
            .order_by(cast(TimeEntry.started_at, Date).desc())
        )
        return list(result.scalars().all())
