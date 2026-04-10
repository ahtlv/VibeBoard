from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.column import Column


class ColumnRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, column_id: uuid.UUID) -> Optional[Column]:
        result = await self._db.execute(select(Column).where(Column.id == column_id))
        return result.scalar_one_or_none()

    async def _next_position(self, board_id: uuid.UUID) -> int:
        result = await self._db.execute(
            select(func.coalesce(func.max(Column.position), -1)).where(
                Column.board_id == board_id
            )
        )
        max_pos: int = result.scalar_one()
        return max_pos + 1

    async def create(self, *, title: str, board_id: uuid.UUID) -> Column:
        position = await self._next_position(board_id)
        column = Column(title=title, board_id=board_id, position=position)
        self._db.add(column)
        await self._db.flush()
        await self._db.refresh(column)
        return column
