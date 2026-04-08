# Импортируем все модели здесь, чтобы Alembic видел их через Base.metadata
from app.models.user import User  # noqa: F401
from app.models.workspace import Workspace  # noqa: F401
from app.models.workspace_member import WorkspaceMember  # noqa: F401
from app.models.board import Board  # noqa: F401
from app.models.column import Column  # noqa: F401
from app.models.task import Task  # noqa: F401
from app.models.checklist_item import ChecklistItem  # noqa: F401
from app.models.time_entry import TimeEntry  # noqa: F401
from app.models.subscription import Subscription  # noqa: F401

__all__ = ["User", "Workspace", "WorkspaceMember", "Board", "Column", "Task", "ChecklistItem", "TimeEntry", "Subscription"]
