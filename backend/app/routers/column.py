from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.column import ColumnCreate, ColumnResponse
from app.services.column import BoardAccessDeniedError, BoardNotFoundError, ColumnService

router = APIRouter(prefix="/columns", tags=["columns"])


@router.post(
    "",
    response_model=ColumnResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_column(
    body: ColumnCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ColumnResponse:
    service = ColumnService(db)
    try:
        column = await service.create(body, current_user_id=current_user.id)
    except BoardNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Board not found")
    except BoardAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    return ColumnResponse.from_orm(column)
