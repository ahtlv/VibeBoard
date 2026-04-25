from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace
from app.models.workspace_member import WorkspaceMember


class WorkspaceRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_by_id(self, workspace_id: uuid.UUID) -> Optional[Workspace]:
        result = await self._db.execute(
            select(Workspace).where(Workspace.id == workspace_id)
        )
        return result.scalar_one_or_none()

    async def list_for_user(self, user_id: uuid.UUID) -> list[Workspace]:
        """Возвращает все workspace, в которых состоит пользователь."""
        result = await self._db.execute(
            select(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(WorkspaceMember.user_id == user_id)
            .order_by(Workspace.created_at)
        )
        return list(result.scalars().all())

    async def create(
        self,
        *,
        name: str,
        owner_id: uuid.UUID,
        description: Optional[str] = None,
    ) -> Workspace:
        """Создаёт Workspace и WorkspaceMember(role='owner') атомарно.

        Обе записи добавляются в одну транзакцию через flush.
        Commit выполняет вызывающий сервис.
        """
        workspace = Workspace(
            name=name,
            owner_id=owner_id,
            description=description,
        )
        self._db.add(workspace)
        await self._db.flush()  # получаем workspace.id

        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=owner_id,
            role="owner",
        )
        self._db.add(member)
        await self._db.flush()
        await self._db.refresh(workspace)

        return workspace

    async def list_members(self, workspace_id: uuid.UUID) -> list[WorkspaceMember]:
        result = await self._db.execute(
            select(WorkspaceMember)
            .where(WorkspaceMember.workspace_id == workspace_id)
            .order_by(WorkspaceMember.joined_at)
        )
        return list(result.scalars().all())

    async def get_member(
        self, workspace_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[WorkspaceMember]:
        result = await self._db.execute(
            select(WorkspaceMember)
            .where(WorkspaceMember.workspace_id == workspace_id)
            .where(WorkspaceMember.user_id == user_id)
        )
        return result.scalar_one_or_none()
