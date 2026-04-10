from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.board import BoardCreate, BoardResponse, BoardSummary
from app.services.board import BoardService, WorkspaceAccessDeniedError, WorkspaceNotFoundError

router = APIRouter(prefix="/boards", tags=["boards"])


@router.post(
    "",
    response_model=BoardResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_board(
    body: BoardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BoardResponse:
    service = BoardService(db)
    try:
        board = await service.create(body, current_user_id=current_user.id)
    except WorkspaceNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workspace not found")
    except WorkspaceAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    return BoardResponse.from_orm(board)


@router.get("", response_model=list[BoardSummary])
async def list_boards(
    workspace_id: str = Query(..., description="UUID воркспейса"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[BoardSummary]:
    service = BoardService(db)
    try:
        boards = await service.list_for_workspace(workspace_id, current_user_id=current_user.id)
    except WorkspaceNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workspace not found")
    except WorkspaceAccessDeniedError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not a workspace member")
    return [BoardSummary.from_orm(b) for b in boards]
