import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.task import ChecklistItemResponse, ChecklistItemUpdate
from app.services.checklist_item import (
    ChecklistItemService,
    ItemNotFoundError,
    TaskAccessDeniedError,
    TaskNotFoundError,
)

router = APIRouter(prefix="/checklist-items", tags=["checklist-items"])


@router.patch("/{item_id}", response_model=ChecklistItemResponse)
async def toggle_checklist_item(
    item_id: str,
    body: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChecklistItemResponse:
    service = ChecklistItemService(db)
    try:
        item = await service.toggle(
            uuid.UUID(item_id), body.is_completed, current_user_id=current_user.id
        )
    except ItemNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Checklist item not found")
    except TaskNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    except TaskAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    return ChecklistItemResponse.from_orm(item)
