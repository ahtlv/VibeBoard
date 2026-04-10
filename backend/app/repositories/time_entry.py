from __future__ import annotations

import math
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.time_entry import TimeEntry


class TimeEntryRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_active_for_user(self, user_id: uuid.UUID) -> Optional[TimeEntry]:
        result = await self._db.execute(
            select(TimeEntry)
            .where(TimeEntry.user_id == user_id)
            .where(TimeEntry.status == "active")
        )
        return result.scalar_one_or_none()

    async def stop(self, entry: TimeEntry) -> TimeEntry:
        ended_at = datetime.now(tz=timezone.utc)
        entry.ended_at = ended_at
        entry.duration_seconds = math.floor((ended_at - entry.started_at).total_seconds())
        entry.status = "completed"
        await self._db.flush()
        await self._db.refresh(entry)
        return entry

    async def create_active(
        self,
        *,
        task_id: uuid.UUID,
        user_id: uuid.UUID,
        source: str = "tracker",
    ) -> TimeEntry:
        entry = TimeEntry(
            task_id=task_id,
            user_id=user_id,
            started_at=datetime.now(tz=timezone.utc),
            status="active",
            source=source,
        )
        self._db.add(entry)
        await self._db.flush()
        await self._db.refresh(entry)
        return entry
