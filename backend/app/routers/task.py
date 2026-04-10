import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.task import ChecklistItemCreate, ChecklistItemResponse, TaskCreate, TaskMoveRequest, TaskResponse, TaskUpdate
from app.services.checklist_item import (
    ChecklistItemService,
    TaskAccessDeniedError,
    TaskNotFoundError as ChecklistTaskNotFoundError,
)
from app.services.task import (
    BoardAccessDeniedError,
    BoardNotFoundError,
    ColumnBoardMismatchError,
    ColumnNotFoundError,
    TaskNotFoundError,
    TaskService,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(db)
    try:
        task = await service.create(body, current_user_id=current_user.id)
    except BoardNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    except BoardAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    except ColumnNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Column not found")
    except ColumnBoardMismatchError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Column does not belong to this board")
    return TaskResponse.from_orm(task)


@router.post(
    "/{task_id}/checklist-items",
    response_model=ChecklistItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_checklist_item(
    task_id: str,
    body: ChecklistItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChecklistItemResponse:
    service = ChecklistItemService(db)
    try:
        item = await service.create(
            uuid.UUID(task_id), body, current_user_id=current_user.id
        )
    except ChecklistTaskNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    except TaskAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    return ChecklistItemResponse.from_orm(item)


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(db)
    try:
        task = await service.update(
            uuid.UUID(task_id), body, current_user_id=current_user.id
        )
    except TaskNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    except BoardNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    except BoardAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    return TaskResponse.from_orm(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    service = TaskService(db)
    try:
        await service.delete(uuid.UUID(task_id), current_user_id=current_user.id)
    except TaskNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    except BoardNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    except BoardAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")


@router.patch("/{task_id}/move", response_model=TaskResponse)
async def move_task(
    task_id: str,
    body: TaskMoveRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TaskResponse:
    service = TaskService(db)
    try:
        task = await service.move(uuid.UUID(task_id), body, current_user_id=current_user.id)
    except TaskNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    except BoardNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    except BoardAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    except ColumnNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Column not found")
    except ColumnBoardMismatchError:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Column does not belong to this board")
    return TaskResponse.from_orm(task)
