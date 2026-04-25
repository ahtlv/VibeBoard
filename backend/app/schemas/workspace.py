from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None


class WorkspaceResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    owner_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, ws: object) -> "WorkspaceResponse":
        from app.models.workspace import Workspace as WS
        w: WS = ws  # type: ignore[assignment]
        return cls(
            id=str(w.id),
            name=w.name,
            description=w.description,
            owner_id=str(w.owner_id),
            created_at=w.created_at,
            updated_at=w.updated_at,
        )


# ── members ───────────────────────────────────────────────────────────────────

class WorkspaceMemberResponse(BaseModel):
    id: str
    user_id: str
    name: str
    email: str
    avatar_url: Optional[str]
    role: str
    joined_at: datetime

    @classmethod
    def from_orm(cls, wm: object) -> "WorkspaceMemberResponse":
        from app.models.workspace_member import WorkspaceMember as WM
        m: WM = wm  # type: ignore[assignment]
        return cls(
            id=str(m.id),
            user_id=str(m.user_id),
            name=m.user.name,
            email=m.user.email,
            avatar_url=m.user.avatar_url,
            role=m.role,
            joined_at=m.joined_at,
        )


# ── invitation ────────────────────────────────────────────────────────────────

class InviteRequest(BaseModel):
    email: EmailStr
    role: Literal["member", "admin"] = "member"


class InvitationResponse(BaseModel):
    id: str
    workspace_id: str
    invited_by: Optional[str]
    email: str
    role: str
    status: str
    expires_at: datetime
    created_at: datetime

    @classmethod
    def from_orm(cls, inv: object) -> "InvitationResponse":
        from app.models.invitation import Invitation as Inv
        i: Inv = inv  # type: ignore[assignment]
        return cls(
            id=str(i.id),
            workspace_id=str(i.workspace_id),
            invited_by=str(i.invited_by) if i.invited_by else None,
            email=i.email,
            role=i.role,
            status=i.status,
            expires_at=i.expires_at,
            created_at=i.created_at,
        )
