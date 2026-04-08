from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.column import ColumnResponse


# ── board ─────────────────────────────────────────────────────────────────────

class BoardCreate(BaseModel):
    workspace_id: str
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None


class BoardUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None


class BoardSummary(BaseModel):
    """Лёгкий вид для списков — без колонок и задач."""
    id: str
    workspace_id: str
    title: str
    description: Optional[str]
    is_archived: bool
    column_count: int = 0
    task_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BoardResponse(BaseModel):
    """Полная доска с колонками и задачами."""
    id: str
    workspace_id: str
    created_by: Optional[str]
    title: str
    description: Optional[str]
    is_archived: bool
    columns: list[ColumnResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
