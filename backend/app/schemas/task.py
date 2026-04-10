from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


# ── checklist ─────────────────────────────────────────────────────────────────

class ChecklistItemCreate(BaseModel):
    text: str = Field(min_length=1, max_length=1000)


class ChecklistItemUpdate(BaseModel):
    is_completed: bool


class ChecklistItemResponse(BaseModel):
    id: str
    task_id: str
    text: str
    is_completed: bool
    position: int

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm(cls, c: object) -> "ChecklistItemResponse":
        from app.models.checklist_item import ChecklistItem as CI
        item: CI = c  # type: ignore[assignment]
        return cls(
            id=str(item.id),
            task_id=str(item.task_id),
            text=item.text,
            is_completed=item.is_completed,
            position=item.position,
        )


# ── task ──────────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    board_id: str
    column_id: str
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    priority: str = "medium"          # low | medium | high | urgent
    due_date: Optional[datetime] = None


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

    @classmethod
    def from_orm(cls, t: object) -> "TaskResponse":
        from app.models.task import Task as T
        task: T = t  # type: ignore[assignment]
        return cls(
            id=str(task.id),
            board_id=str(task.board_id),
            column_id=str(task.column_id),
            created_by=str(task.created_by) if task.created_by else None,
            title=task.title,
            description=task.description,
            position=task.position,
            status=task.status,
            priority=task.priority,
            due_date=task.due_date,
            tracked_time_total=task.tracked_time_total,
            pomodoro_sessions_count=task.pomodoro_sessions_count,
            recurring_rule=task.recurring_rule,
            is_archived=task.is_archived,
            checklist_items=[],
            created_at=task.created_at,
            updated_at=task.updated_at,
        )
