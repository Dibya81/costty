"""Folder management endpoints."""

import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user, get_db, get_pagination
from app.models.user import User
from app.repositories import folder_repository
from app.schemas.folder import (
    FolderCreateRequest,
    FolderListResponse,
    FolderResponse,
    FolderUpdateRequest,
)
from app.services import folder_service
from app.services.folder_service import FolderNotFoundError, InvalidFolderOperationError

router = APIRouter(prefix="/api/v1/folders", tags=["Folders"])


@router.post(
    "",
    response_model=FolderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a folder",
    description="Creates a new folder, optionally nested under a parent folder.",
)
def create_folder(
    payload: FolderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FolderResponse:
    owner_id = str(current_user.id)
    try:
        folder = folder_service.create_folder(
            db, owner_id, payload.name, payload.parent_folder_id
        )
    except FolderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return FolderResponse.model_validate(folder)


@router.get(
    "/{folder_id}",
    response_model=FolderResponse,
    summary="Get a folder",
    responses={404: {"description": "Folder not found."}},
)
def get_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FolderResponse:
    owner_id = str(current_user.id)
    try:
        folder = folder_service.get_folder(db, folder_id, owner_id)
    except FolderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return FolderResponse.model_validate(folder)


@router.get(
    "",
    response_model=FolderListResponse,
    summary="List folders",
    description="Lists folders for the current user, filtered to a single parent level at a time.",
)
def list_folders(
    parent_folder_id: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pagination: PaginationParams = Depends(get_pagination),
) -> FolderListResponse:
    owner_id = str(current_user.id)
    items, total = folder_repository.list_folders(
        db, owner_id, parent_folder_id, pagination.offset, pagination.page_size
    )
    total_pages = math.ceil(total / pagination.page_size) if total else 0
    return FolderListResponse(
        items=[FolderResponse.model_validate(f) for f in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
    )


@router.patch(
    "/{folder_id}",
    response_model=FolderResponse,
    summary="Rename or move a folder",
    responses={404: {"description": "Folder (or destination parent folder) not found."}},
)
def update_folder(
    folder_id: int,
    payload: FolderUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FolderResponse:
    owner_id = str(current_user.id)
    try:
        folder = folder_service.update_folder(
            db,
            folder_id,
            owner_id,
            name=payload.name,
            parent_folder_id=payload.parent_folder_id,
            move_to_root=payload.move_to_root,
        )
    except FolderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidFolderOperationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return FolderResponse.model_validate(folder)


@router.delete(
    "/{folder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an empty folder",
    responses={
        404: {"description": "Folder not found."},
        400: {"description": "Folder is not empty."},
    },
)
def delete_folder(
    folder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    owner_id = str(current_user.id)
    try:
        folder_service.delete_folder(db, folder_id, owner_id)
    except FolderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InvalidFolderOperationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
