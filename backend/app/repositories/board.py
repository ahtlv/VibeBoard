from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.board import Board


class BoardRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, board_id: uuid.UUID) -> Optional[Board]:
        result = await self._db.execute(select(Board).where(Board.id == board_id))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        title: str,
        workspace_id: uuid.UUID,
        created_by: Optional[uuid.UUID] = None,
        description: Optional[str] = None,
    ) -> Board:
        board = Board(
            title=title,
            workspace_id=workspace_id,
            created_by=created_by,
            description=description,
        )
        self._db.add(board)
        await self._db.flush()
        await self._db.refresh(board)
        return board

    async def count_for_user(self, user_id: uuid.UUID) -> int:
        """Количество активных (не заархивированных) досок, созданных пользователем."""
        result = await self._db.execute(
            select(func.count())
            .where(Board.created_by == user_id, Board.is_archived.is_(False))
        )
        return result.scalar_one()

    async def list_for_workspace(
        self,
        workspace_id: uuid.UUID,
        *,
        limit: int = 50,
        offset: int = 0,
        include_archived: bool = False,
    ) -> list[Board]:
        stmt = (
            select(Board)
            .where(Board.workspace_id == workspace_id)
            .order_by(Board.created_at)
            .limit(limit)
            .offset(offset)
        )
        if not include_archived:
            stmt = stmt.where(Board.is_archived.is_(False))
        result = await self._db.execute(stmt)
        return list(result.scalars().all())
