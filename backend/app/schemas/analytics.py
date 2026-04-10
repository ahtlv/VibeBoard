from __future__ import annotations

from pydantic import BaseModel


class AnalyticsOverview(BaseModel):
    completed_tasks_count: int
    total_tracked_time: int   # секунды
    streak: int               # дней подряд
