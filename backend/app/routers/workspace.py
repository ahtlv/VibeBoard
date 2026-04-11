import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.models.user import User
from app.repositories.workspace import WorkspaceRepository
from app.schemas.workspace import InvitationResponse, InviteRequest, WorkspaceCreate, WorkspaceResponse
from app.services.workspace import (
    AlreadyInvitedError,
    AlreadyMemberError,
    InsufficientPermissionsError,
    WorkspaceNotFoundError,
    WorkspaceService,
)

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


@router.get("", response_model=list[WorkspaceResponse])
async def list_workspaces(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[WorkspaceResponse]:
    workspaces = await WorkspaceRepository(db).list_for_user(current_user.id)
    return [WorkspaceResponse.from_orm(ws) for ws in workspaces]


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace(
    body: WorkspaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    service = WorkspaceService(db)
    workspace = await service.create(body, owner_id=current_user.id)
    return WorkspaceResponse.from_orm(workspace)


@router.post(
    "/{workspace_id}/invite",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def invite_member(
    workspace_id: str,
    body: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InvitationResponse:
    try:
        invitation = await WorkspaceService(db).invite_member(
            workspace_id=uuid.UUID(workspace_id),
            inviter_id=current_user.id,
            email=str(body.email),
            role=body.role,
        )
    except WorkspaceNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Workspace not found")
    except InsufficientPermissionsError:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only owner or admin can invite members")
    except AlreadyMemberError:
        raise HTTPException(status.HTTP_409_CONFLICT, "User is already a member of this workspace")
    except AlreadyInvitedError:
        raise HTTPException(status.HTTP_409_CONFLICT, "A pending invitation for this email already exists")
    return InvitationResponse.from_orm(invitation)
