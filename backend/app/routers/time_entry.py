from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.time_entry import TimeEntryResponse, TimeEntryStartRequest
from app.services.time_entry import (
    ActiveSessionExistsError,
    NoActiveSessionError,
    TaskAccessDeniedError,
    TaskNotFoundError,
    TimeEntryService,
)

router = APIRouter(prefix="/time-entries", tags=["time-entries"])


@router.post(
    "/start",
    response_model=TimeEntryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def start_time_entry(
    body: TimeEntryStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TimeEntryResponse:
    service = TimeEntryService(db)
    try:
        entry = await service.start(body, current_user_id=current_user.id)
    except TaskNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Task not found")
    except TaskAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    except ActiveSessionExistsError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Active time entry already exists")
    return TimeEntryResponse.from_orm(entry)


@router.post("/stop", response_model=TimeEntryResponse)
async def stop_time_entry(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TimeEntryResponse:
    service = TimeEntryService(db)
    try:
        entry = await service.stop(current_user_id=current_user.id)
    except NoActiveSessionError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active time entry")
    return TimeEntryResponse.from_orm(entry)
