from __future__ import annotations

import uuid
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.analytics import AnalyticsRepository
from app.schemas.analytics import AnalyticsOverview


def _calculate_streak(active_days: list[date]) -> int:
    """Считаем подряд идущие дни назад от сегодня.

    Если сегодня нет активности — стрик начинается со вчера
    (незавершённый день не обнуляет стрик).
    """
    if not active_days:
        return 0

    days_set = set(active_days)
    today = date.today()
    # Начинаем с сегодня; если нет — со вчера
    cursor = today if today in days_set else today - timedelta(days=1)

    streak = 0
    while cursor in days_set:
        streak += 1
        cursor -= timedelta(days=1)

    return streak


class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self._repo = AnalyticsRepository(db)

    async def get_overview(self, user_id: uuid.UUID) -> AnalyticsOverview:
        completed, tracked, active_days = (
            await self._repo.completed_tasks_count(user_id),
            await self._repo.total_tracked_time(user_id),
            await self._repo.active_days(user_id),
        )
        return AnalyticsOverview(
            completed_tasks_count=completed,
            total_tracked_time=tracked,
            streak=_calculate_streak(active_days),
        )
