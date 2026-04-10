from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.board import Board
from app.repositories.board import BoardRepository
from app.repositories.workspace import WorkspaceRepository
from app.schemas.board import BoardCreate


class WorkspaceNotFoundError(Exception):
    pass


class WorkspaceAccessDeniedError(Exception):
    pass


class BoardService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._board_repo = BoardRepository(db)
        self._ws_repo = WorkspaceRepository(db)

    async def create(self, data: BoardCreate, current_user_id: uuid.UUID) -> Board:
        workspace_id = uuid.UUID(data.workspace_id)

        workspace = await self._ws_repo.get_by_id(workspace_id)
        if workspace is None:
            raise WorkspaceNotFoundError(workspace_id)

        member = await self._ws_repo.get_member(workspace_id, current_user_id)
        if member is None:
            raise WorkspaceAccessDeniedError(workspace_id)

        board = await self._board_repo.create(
            title=data.title,
            workspace_id=workspace_id,
            created_by=current_user_id,
            description=data.description,
        )
        await self._db.commit()
        return board

    async def list_for_workspace(
        self, workspace_id_str: str, current_user_id: uuid.UUID
    ) -> list[Board]:
        workspace_id = uuid.UUID(workspace_id_str)

        workspace = await self._ws_repo.get_by_id(workspace_id)
        if workspace is None:
            raise WorkspaceNotFoundError(workspace_id)

        member = await self._ws_repo.get_member(workspace_id, current_user_id)
        if member is None:
            raise WorkspaceAccessDeniedError(workspace_id)

        return await self._board_repo.list_for_workspace(workspace_id)
