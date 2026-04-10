from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TimeEntryStartRequest(BaseModel):
    task_id: str
    source: str = "tracker"  # manual | pomodoro | tracker


class TimeEntryResponse(BaseModel):
    id: str
    task_id: str
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: Optional[int]
    status: str
    source: str
    note: Optional[str]
    created_at: datetime

    @classmethod
    def from_orm(cls, e: object) -> "TimeEntryResponse":
        from app.models.time_entry import TimeEntry as TE
        entry: TE = e  # type: ignore[assignment]
        return cls(
            id=str(entry.id),
            task_id=str(entry.task_id),
            user_id=str(entry.user_id),
            started_at=entry.started_at,
            ended_at=entry.ended_at,
            duration_seconds=entry.duration_seconds,
            status=entry.status,
            source=entry.source,
            note=entry.note,
            created_at=entry.created_at,
        )
