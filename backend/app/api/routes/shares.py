"""Share-link endpoints."""

import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user, get_db, get_pagination
from app.models.file import FileRecord
from app.models.share import ShareLink
from app.models.user import User
from app.schemas.share import (
    CreateShareRequest,
    PublicShareResponse,
    ShareLinkResponse,
)
from app.services import share_service

router = APIRouter(prefix="/api/v1/shares", tags=["Shares"])


def _to_response(link: ShareLink, file_name: str | None = None) -> ShareLinkResponse:
    return ShareLinkResponse(
        id=link.id,
        slug=link.slug,
        file_id=link.file_id,
        file_name=file_name or "",
        permission=link.permission,
        password=bool(link.password_hash),
        expires_at=link.expires_at,
        revoked=link.revoked,
        view_count=link.view_count,
        created_at=link.created_at,
    )


@router.post("", response_model=ShareLinkResponse, status_code=status.HTTP_201_CREATED)
def create_share(
    payload: CreateShareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShareLinkResponse:
    owner_id = str(current_user.id)
    file_record = (
        db.query(FileRecord)
        .filter(FileRecord.id == payload.file_id, FileRecord.owner_id == owner_id)
        .first()
    )
    if file_record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found.")
    link = share_service.create_share(
        db,
        file_id=payload.file_id,
        owner_id=owner_id,
        permission=payload.permission,
        password=payload.password,
        expires_in_hours=payload.expires_in_hours,
    )
    return _to_response(link, file_name=file_record.filename)


@router.get("", response_model=list[ShareLinkResponse])
def list_shares(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ShareLinkResponse]:
    owner_id = str(current_user.id)
    items, _ = share_service.list_shares(db, owner_id, offset=0, limit=200)
    results = []
    for link in items:
        file_record = db.query(FileRecord).filter(FileRecord.id == link.file_id).first()
        results.append(_to_response(link, file_name=file_record.filename if file_record else ""))
    return results


@router.delete("/{link_id}", response_model=ShareLinkResponse)
def revoke_share(
    link_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ShareLinkResponse:
    owner_id = str(current_user.id)
    try:
        link = share_service.revoke_share(db, link_id, owner_id)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    file_record = db.query(FileRecord).filter(FileRecord.id == link.file_id).first()
    return _to_response(link, file_name=file_record.filename if file_record else "")
