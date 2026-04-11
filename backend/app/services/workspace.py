from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invitation import Invitation
from app.models.workspace import Workspace
from app.repositories.invitation import InvitationRepository
from app.repositories.user import UserRepository
from app.repositories.workspace import WorkspaceRepository
from app.schemas.workspace import WorkspaceCreate

_CAN_INVITE = frozenset({"owner", "admin"})


class WorkspaceNotFoundError(Exception):
    pass


class InsufficientPermissionsError(Exception):
    """Пользователь не имеет прав owner/admin в этом workspace."""
    pass


class AlreadyMemberError(Exception):
    """Email уже является участником workspace."""
    pass


class AlreadyInvitedError(Exception):
    """Для этого email уже есть активное (pending) приглашение."""
    pass


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

    async def invite_member(
        self,
        workspace_id: uuid.UUID,
        inviter_id: uuid.UUID,
        email: str,
        role: str,
    ) -> Invitation:
        # 1. Workspace существует
        workspace = await self._repo.get_by_id(workspace_id)
        if workspace is None:
            raise WorkspaceNotFoundError(workspace_id)

        # 2. Отправитель является участником
        inviter_member = await self._repo.get_member(workspace_id, inviter_id)
        if inviter_member is None:
            raise InsufficientPermissionsError

        # 3. Отправитель имеет роль owner или admin
        if inviter_member.role not in _CAN_INVITE:
            raise InsufficientPermissionsError

        # 4. Проверяем: пользователь с этим email уже состоит в workspace
        existing_user = await UserRepository(self._db).get_by_email(email)
        if existing_user is not None:
            existing_member = await self._repo.get_member(workspace_id, existing_user.id)
            if existing_member is not None:
                raise AlreadyMemberError(email)

        # 5. Проверяем: нет активного приглашения на этот email
        inv_repo = InvitationRepository(self._db)
        pending = await inv_repo.get_pending_by_workspace_email(workspace_id, email)
        if pending is not None:
            raise AlreadyInvitedError(email)

        # 6. Создаём приглашение
        invitation = await inv_repo.create(
            workspace_id=workspace_id,
            invited_by=inviter_id,
            email=email,
            role=role,
        )
        await self._db.commit()
        return invitation
