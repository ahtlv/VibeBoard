from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace
from app.repositories.workspace import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate


class WorkspaceService:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._repo = WorkspaceRepository(db)

    async def create(self, data: WorkspaceCreate, owner_id: uuid.UUID) -> Workspace:
        workspace = await self._repo.create(
            name=data.name,
            owner_id=owner_id,
            description=data.description,
        )
        await self._db.commit()
        return workspace
