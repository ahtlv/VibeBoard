from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.time_entry import TimeEntry
from app.repositories.board import BoardRepository
from app.repositories.task import TaskRepository
from app.repositories.time_entry import TimeEntryRepository
from app.repositories.workspace import WorkspaceRepository
from app.schemas.time_entry import TimeEntryStartRequest


class TaskNotFoundError(Exception):
    pass


class TaskAccessDeniedError(Exception):
    pass


class ActiveSessionExistsError(Exception):
    pass


class NoActiveSessionError(Exception):
    pass


class TimeEntryService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._entry_repo = TimeEntryRepository(db)
        self._task_repo = TaskRepository(db)
        self._board_repo = BoardRepository(db)
        self._ws_repo = WorkspaceRepository(db)

    async def start(
        self, data: TimeEntryStartRequest, current_user_id: uuid.UUID
    ) -> TimeEntry:
        task_id = uuid.UUID(data.task_id)

        task = await self._task_repo.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        board = await self._board_repo.get_by_id(task.board_id)
        member = await self._ws_repo.get_member(board.workspace_id, current_user_id)  # type: ignore[union-attr]
        if member is None:
            raise TaskAccessDeniedError(task_id)

        existing = await self._entry_repo.get_active_for_user(current_user_id)
        if existing is not None:
            raise ActiveSessionExistsError(existing.id)

        entry = await self._entry_repo.create_active(
            task_id=task_id,
            user_id=current_user_id,
            source=data.source,
        )
        await self._db.commit()
        return entry

    async def stop(self, current_user_id: uuid.UUID) -> TimeEntry:
        entry = await self._entry_repo.get_active_for_user(current_user_id)
        if entry is None:
            raise NoActiveSessionError()
        entry = await self._entry_repo.stop(entry)
        await self._db.commit()
        return entry
