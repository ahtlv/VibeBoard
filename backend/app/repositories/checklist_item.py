from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checklist_item import ChecklistItem


class ChecklistItemRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, item_id: uuid.UUID) -> Optional[ChecklistItem]:
        result = await self._db.execute(
            select(ChecklistItem).where(ChecklistItem.id == item_id)
        )
        return result.scalar_one_or_none()

    async def set_completed(self, item: ChecklistItem, value: bool) -> ChecklistItem:
        item.is_completed = value
        await self._db.flush()
        await self._db.refresh(item)
        return item

    async def _next_position(self, task_id: uuid.UUID) -> int:
        result = await self._db.execute(
            select(func.coalesce(func.max(ChecklistItem.position), -1)).where(
                ChecklistItem.task_id == task_id
            )
        )
        return result.scalar_one() + 1

    async def create(self, *, task_id: uuid.UUID, text: str) -> ChecklistItem:
        position = await self._next_position(task_id)
        item = ChecklistItem(task_id=task_id, text=text, position=position)
        self._db.add(item)
        await self._db.flush()
        await self._db.refresh(item)
        return item
