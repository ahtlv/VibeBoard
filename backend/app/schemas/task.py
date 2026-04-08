from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── checklist ─────────────────────────────────────────────────────────────────

class ChecklistItemResponse(BaseModel):
    id: str
    task_id: str
    text: str
    is_completed: bool
    position: int

    model_config = {"from_attributes": True}


# ── task ──────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    priority: str = "medium"          # low | medium | high | urgent
    due_date: Optional[datetime] = None
    position: Optional[int] = None    # если None — сервис ставит в конец


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = None      # todo | in_progress | in_review | done
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_ids: Optional[list[str]] = None


class TaskMoveRequest(BaseModel):
    column_id: str
    position: int = Field(ge=0)


class TaskResponse(BaseModel):
    id: str
    board_id: str
    column_id: str
    created_by: Optional[str]
    title: str
    description: Optional[str]
    position: int
    status: str
    priority: str
    due_date: Optional[datetime]
    tracked_time_total: int
    pomodoro_sessions_count: int
    recurring_rule: Optional[dict]
    is_archived: bool
    checklist_items: list[ChecklistItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
