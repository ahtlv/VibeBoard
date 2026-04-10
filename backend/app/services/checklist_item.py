from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.checklist_item import ChecklistItem
from app.repositories.board import BoardRepository
from app.repositories.checklist_item import ChecklistItemRepository
from app.repositories.task import TaskRepository
from app.repositories.workspace import WorkspaceRepository
from app.schemas.task import ChecklistItemCreate


class TaskNotFoundError(Exception):
    pass


class TaskAccessDeniedError(Exception):
    pass


class ItemNotFoundError(Exception):
    pass


class ChecklistItemService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._item_repo = ChecklistItemRepository(db)
        self._task_repo = TaskRepository(db)
        self._board_repo = BoardRepository(db)
        self._ws_repo = WorkspaceRepository(db)

    async def _check_access(self, item: ChecklistItem, current_user_id: uuid.UUID) -> None:
        task = await self._task_repo.get_by_id(item.task_id)
        if task is None:
            raise TaskNotFoundError(item.task_id)
        board = await self._board_repo.get_by_id(task.board_id)
        member = await self._ws_repo.get_member(board.workspace_id, current_user_id)  # type: ignore[union-attr]
        if member is None:
            raise TaskAccessDeniedError(item.task_id)

    async def create(
        self,
        task_id: uuid.UUID,
        data: ChecklistItemCreate,
        current_user_id: uuid.UUID,
    ) -> ChecklistItem:
        task = await self._task_repo.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        board = await self._board_repo.get_by_id(task.board_id)
        member = await self._ws_repo.get_member(board.workspace_id, current_user_id)  # type: ignore[union-attr]
        if member is None:
            raise TaskAccessDeniedError(task_id)

        item = await self._item_repo.create(task_id=task_id, text=data.text)
        await self._db.commit()
        return item

    async def toggle(
        self, item_id: uuid.UUID, is_completed: bool, current_user_id: uuid.UUID
    ) -> ChecklistItem:
        item = await self._item_repo.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundError(item_id)
        await self._check_access(item, current_user_id)
        item = await self._item_repo.set_completed(item, is_completed)
        await self._db.commit()
        return item
