from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.invitation import Invitation

INVITATION_TTL_DAYS = 7


class InvitationRepository:
    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def get_pending_by_workspace_email(
        self, workspace_id: uuid.UUID, email: str
    ) -> Optional[Invitation]:
        result = await self._db.execute(
            select(Invitation).where(
                Invitation.workspace_id == workspace_id,
                Invitation.email == email.lower(),
                Invitation.status == "pending",
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        workspace_id: uuid.UUID,
        invited_by: uuid.UUID,
        email: str,
        role: str,
    ) -> Invitation:
        invitation = Invitation(
            workspace_id=workspace_id,
            invited_by=invited_by,
            email=email.lower(),
            role=role,
            token=secrets.token_urlsafe(32),
            status="pending",
            expires_at=datetime.now(tz=timezone.utc) + timedelta(days=INVITATION_TTL_DAYS),
        )
        self._db.add(invitation)
        await self._db.flush()
        await self._db.refresh(invitation)
        return invitation
