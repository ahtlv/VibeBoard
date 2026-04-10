from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.task import TaskResponse


# ── column ────────────────────────────────────────────────────────────────────

class ColumnCreate(BaseModel):
    board_id: str
    title: str = Field(min_length=1, max_length=255)


class ColumnUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)


class ColumnReorderItem(BaseModel):
    id: str
    position: int = Field(ge=0)


class ColumnReorderRequest(BaseModel):
    columns: list[ColumnReorderItem] = Field(min_length=1)


class ColumnResponse(BaseModel):
    id: str
    board_id: str
    title: str
    position: int
    tasks: list[TaskResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, c: object) -> "ColumnResponse":
        from app.models.column import Column as C
        col: C = c  # type: ignore[assignment]
        return cls(
            id=str(col.id),
            board_id=str(col.board_id),
            title=col.title,
            position=col.position,
            tasks=[],
            created_at=col.created_at,
            updated_at=col.updated_at,
        )
