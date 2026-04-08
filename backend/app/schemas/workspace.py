from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


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
