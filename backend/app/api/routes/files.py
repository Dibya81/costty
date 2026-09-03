"""File management endpoints."""

import math

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import (
    PaginationParams,
    get_current_user,
    get_db,
    get_pagination,
    get_storage,
)
from app.core.config import Settings, get_settings
from app.core.storage import StorageBackend
from app.models.user import User
from app.repositories import file_repository
from app.schemas.file import FileListResponse, FileResponse, FileUpdateRequest
from app.services import file_service
from app.services.file_service import FileNotFoundError, InvalidFileError

router = APIRouter(prefix="/api/v1/files", tags=["Files"])


@router.post(
    "",
    response_model=FileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a file",
    description=(
        "Uploads a file (multipart/form-data) into the user's document library, "
        "optionally into a specific folder. Supported formats: PDF, DOC/DOCX, "
        "PPT/PPTX, XLS/XLSX, TXT, CSV, and common image formats."
    ),
    responses={
        400: {"description": "Unsupported file type, empty file, or file too large."},
        404: {"description": "Target folder not found."},
    },
)
def upload_file(
    upload: UploadFile = File(...),
    folder_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
    settings: Settings = Depends(get_settings),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    owner_id = str(current_user.id)
    try:
        file_record = file_service.upload_file(
            db=db,
            storage=storage,
            settings=settings,
            owner_id=owner_id,
            filename=upload.filename or "unnamed",
            content_type=upload.content_type or "application/octet-stream",
            file_obj=upload.file,
            folder_id=folder_id,
        )
    except InvalidFileError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return FileResponse.model_validate(file_record)


@router.get(
    "/{file_id}",
    response_model=FileResponse,
    summary="Get file metadata",
    responses={404: {"description": "File not found."}},
)
def get_file_metadata(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    owner_id = str(current_user.id)
    try:
        file_record = file_service.get_file(db, file_id, owner_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return FileResponse.model_validate(file_record)


@router.get(
    "/{file_id}/download",
    summary="Download a file",
    responses={404: {"description": "File not found."}},
)
def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
    current_user: User = Depends(get_current_user),
) -> StreamingResponse:
    owner_id = str(current_user.id)
    try:
        file_record = file_service.get_file(db, file_id, owner_id)
        stream = file_service.open_file_for_download(storage, file_record)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    safe_filename = "".join(ch for ch in file_record.filename if ch not in "\r\n").strip() or "download"

    return StreamingResponse(
        stream,
        media_type=file_record.content_type,
        headers={"Content-Disposition": f'attachment; filename="{safe_filename}"'},
    )


@router.get(
    "",
    response_model=FileListResponse,
    summary="List / search files",
    description=(
        "Lists files owned by the current user. Supports filtering by folder, "
        "free-text filename search, and file extension, plus pagination."
    ),
)
def list_files(
    folder_id: int | None = None,
    q: str | None = None,
    extension: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    pagination: PaginationParams = Depends(get_pagination),
) -> FileListResponse:
    owner_id = str(current_user.id)
    items, total = file_repository.list_files(
        db,
        owner_id=owner_id,
        offset=pagination.offset,
        limit=pagination.page_size,
        folder_id=folder_id,
        folder_filter_active=folder_id is not None,
        search=q,
        extension=extension,
    )
    total_pages = math.ceil(total / pagination.page_size) if total else 0
    return FileListResponse(
        items=[FileResponse.model_validate(f) for f in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
    )


@router.patch(
    "/{file_id}",
    response_model=FileResponse,
    summary="Rename or move a file",
    responses={404: {"description": "File (or destination folder) not found."}},
)
def update_file(
    file_id: int,
    payload: FileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    owner_id = str(current_user.id)
    try:
        file_record = file_service.update_file(
            db,
            file_id,
            owner_id,
            filename=payload.filename,
            folder_id=payload.folder_id,
            move_to_root=payload.move_to_root,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return FileResponse.model_validate(file_record)


@router.delete(
    "/{file_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a file",
    responses={404: {"description": "File not found."}},
)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    storage: StorageBackend = Depends(get_storage),
    current_user: User = Depends(get_current_user),
) -> None:
    owner_id = str(current_user.id)
    try:
        file_service.delete_file(db, storage, file_id, owner_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
