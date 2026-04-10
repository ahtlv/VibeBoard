from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.column import Column
from app.repositories.board import BoardRepository
from app.repositories.column import ColumnRepository
from app.repositories.workspace import WorkspaceRepository
from app.schemas.column import ColumnCreate


class BoardNotFoundError(Exception):
    pass


class BoardAccessDeniedError(Exception):
    pass


class ColumnService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._col_repo = ColumnRepository(db)
        self._board_repo = BoardRepository(db)
        self._ws_repo = WorkspaceRepository(db)

    async def create(self, data: ColumnCreate, current_user_id: uuid.UUID) -> Column:
        board_id = uuid.UUID(data.board_id)

        board = await self._board_repo.get_by_id(board_id)
        if board is None:
            raise BoardNotFoundError(board_id)

        member = await self._ws_repo.get_member(board.workspace_id, current_user_id)
        if member is None:
            raise BoardAccessDeniedError(board_id)

        column = await self._col_repo.create(title=data.title, board_id=board_id)
        await self._db.commit()
        return column
