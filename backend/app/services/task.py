from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.user import User
from app.repositories.board import BoardRepository
from app.repositories.column import ColumnRepository
from app.repositories.task import TaskRepository
from app.repositories.workspace import WorkspaceRepository
from app.schemas.task import TaskCreate, TaskMoveRequest, TaskUpdate


class TaskNotFoundError(Exception):
    pass


class RecurringRuleNotAllowedError(Exception):
    """Попытка установить recurring_rule на free плане."""
    pass


class BoardNotFoundError(Exception):
    pass


class BoardAccessDeniedError(Exception):
    pass


class ColumnNotFoundError(Exception):
    pass


class ColumnBoardMismatchError(Exception):
    """Колонка не принадлежит указанной доске."""
    pass


class TaskService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._task_repo = TaskRepository(db)
        self._col_repo = ColumnRepository(db)
        self._board_repo = BoardRepository(db)
        self._ws_repo = WorkspaceRepository(db)

    async def create(self, data: TaskCreate, current_user: User) -> Task:
        board_id = uuid.UUID(data.board_id)
        column_id = uuid.UUID(data.column_id)

        board = await self._board_repo.get_by_id(board_id)
        if board is None:
            raise BoardNotFoundError(board_id)

        member = await self._ws_repo.get_member(board.workspace_id, current_user.id)
        if member is None:
            raise BoardAccessDeniedError(board_id)

        column = await self._col_repo.get_by_id(column_id)
        if column is None:
            raise ColumnNotFoundError(column_id)

        if column.board_id != board_id:
            raise ColumnBoardMismatchError(column_id)

        if data.recurring_rule is not None and current_user.plan == 'free':
            raise RecurringRuleNotAllowedError

        task = await self._task_repo.create(
            title=data.title,
            board_id=board_id,
            column_id=column_id,
            created_by=current_user.id,
            description=data.description,
            priority=data.priority,
            due_date=data.due_date,
            recurring_rule=data.recurring_rule,
        )
        await self._db.commit()
        return task

    async def update(
        self, task_id: uuid.UUID, data: TaskUpdate, current_user: User
    ) -> Task:
        task = await self._task_repo.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        board = await self._board_repo.get_by_id(task.board_id)
        if board is None:
            raise BoardNotFoundError(task.board_id)

        member = await self._ws_repo.get_member(board.workspace_id, current_user.id)
        if member is None:
            raise BoardAccessDeniedError(task.board_id)

        fields = data.model_dump(exclude_unset=True)

        # Разрешаем обнулять recurring_rule (downgrade scenario), но не устанавливать
        if fields.get('recurring_rule') is not None and current_user.plan == 'free':
            raise RecurringRuleNotAllowedError

        task = await self._task_repo.update(task, fields)
        await self._db.commit()
        return task

    async def delete(self, task_id: uuid.UUID, current_user_id: uuid.UUID) -> None:
        task = await self._task_repo.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        board = await self._board_repo.get_by_id(task.board_id)
        if board is None:
            raise BoardNotFoundError(task.board_id)

        member = await self._ws_repo.get_member(board.workspace_id, current_user_id)
        if member is None:
            raise BoardAccessDeniedError(task.board_id)

        await self._task_repo.delete(task)
        await self._db.commit()

    async def move(
        self, task_id: uuid.UUID, data: TaskMoveRequest, current_user_id: uuid.UUID
    ) -> Task:
        task = await self._task_repo.get_by_id(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)

        board = await self._board_repo.get_by_id(task.board_id)
        if board is None:
            raise BoardNotFoundError(task.board_id)

        member = await self._ws_repo.get_member(board.workspace_id, current_user_id)
        if member is None:
            raise BoardAccessDeniedError(task.board_id)

        target_column_id = uuid.UUID(data.column_id)
        target_column = await self._col_repo.get_by_id(target_column_id)
        if target_column is None:
            raise ColumnNotFoundError(target_column_id)

        if target_column.board_id != task.board_id:
            raise ColumnBoardMismatchError(target_column_id)

        task = await self._task_repo.move(task, target_column_id, data.position)
        await self._db.commit()
        return task
