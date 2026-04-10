from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task


class TaskRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, task_id: uuid.UUID) -> Optional[Task]:
        result = await self._db.execute(select(Task).where(Task.id == task_id))
        return result.scalar_one_or_none()

    async def update(self, task: Task, fields: dict[str, Any]) -> Task:
        for key, value in fields.items():
            setattr(task, key, value)
        await self._db.flush()
        await self._db.refresh(task)
        return task

    async def delete(self, task: Task) -> None:
        await self._db.delete(task)
        await self._db.flush()

    async def move(
        self,
        task: Task,
        target_column_id: uuid.UUID,
        target_position: int,
    ) -> Task:
        source_column_id = task.column_id
        source_position = task.position

        if source_column_id == target_column_id:
            if source_position == target_position:
                return task
            if source_position < target_position:
                # Сдвигаем диапазон (source, target] на -1
                await self._db.execute(
                    update(Task)
                    .where(Task.column_id == target_column_id)
                    .where(Task.id != task.id)
                    .where(Task.position > source_position)
                    .where(Task.position <= target_position)
                    .values(position=Task.position - 1)
                )
            else:
                # Сдвигаем диапазон [target, source) на +1
                await self._db.execute(
                    update(Task)
                    .where(Task.column_id == target_column_id)
                    .where(Task.id != task.id)
                    .where(Task.position >= target_position)
                    .where(Task.position < source_position)
                    .values(position=Task.position + 1)
                )
        else:
            # Закрываем дырку в исходной колонке
            await self._db.execute(
                update(Task)
                .where(Task.column_id == source_column_id)
                .where(Task.position > source_position)
                .values(position=Task.position - 1)
            )
            # Раздвигаем целевую колонку
            await self._db.execute(
                update(Task)
                .where(Task.column_id == target_column_id)
                .where(Task.position >= target_position)
                .values(position=Task.position + 1)
            )

        task.column_id = target_column_id
        task.position = target_position
        await self._db.flush()
        await self._db.refresh(task)
        return task

    async def _next_position(self, column_id: uuid.UUID) -> int:
        result = await self._db.execute(
            select(func.coalesce(func.max(Task.position), -1)).where(
                Task.column_id == column_id
            )
        )
        max_pos: int = result.scalar_one()
        return max_pos + 1

    async def create(
        self,
        *,
        title: str,
        board_id: uuid.UUID,
        column_id: uuid.UUID,
        created_by: Optional[uuid.UUID] = None,
        description: Optional[str] = None,
        priority: str = "medium",
        due_date: Optional[datetime] = None,
    ) -> Task:
        position = await self._next_position(column_id)
        task = Task(
            title=title,
            board_id=board_id,
            column_id=column_id,
            created_by=created_by,
            description=description,
            priority=priority,
            due_date=due_date,
            position=position,
        )
        self._db.add(task)
        await self._db.flush()
        await self._db.refresh(task)
        return task
