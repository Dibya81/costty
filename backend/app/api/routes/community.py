"""Community document-request endpoints."""

import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user, get_db, get_pagination
from app.models.community import CommunityOffer, CommunityRequest
from app.models.user import User
from app.schemas.community import (
    CommunityOfferResponse,
    CommunityRequestListResponse,
    CommunityRequestResponse,
    CreateCommunityOffer,
    CreateCommunityRequest,
)
from app.services import community_service

router = APIRouter(prefix="/api/v1/community", tags=["Community"])


def _offer_to_response(offer: CommunityOffer, author_name: str) -> CommunityOfferResponse:
    return CommunityOfferResponse(
        id=offer.id,
        author_name=author_name,
        note=offer.note,
        file_name=offer.file_name,
        created_at=offer.created_at,
    )


def _request_to_response(
    req: CommunityRequest,
    author_name: str,
    offers: list[CommunityOfferResponse],
) -> CommunityRequestResponse:
    tags = [t for t in (req.tags or "").split(",") if t]
    return CommunityRequestResponse(
        id=req.id,
        title=req.title,
        description=req.description,
        tags=tags,
        author_name=author_name,
        status=req.status,
        created_at=req.created_at,
        offers=offers,
    )


@router.get("/requests", response_model=CommunityRequestListResponse)
def list_requests(
    q: str | None = None,
    status_filter: str | None = None,
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
) -> CommunityRequestListResponse:
    items, total = community_service.list_requests(
        db,
        page=pagination.page,
        page_size=pagination.page_size,
        search=q,
        status=status_filter,
    )
    out: list[CommunityRequestResponse] = []
    for req in items:
        author = db.query(User).filter(User.id == req.author_id).first()
        offers = []
        for o in req.offers:
            o_author = db.query(User).filter(User.id == o.author_id).first()
            offers.append(_offer_to_response(o, o_author.full_name if o_author else "Unknown"))
        out.append(
            _request_to_response(
                req,
                author.full_name if author else "Unknown",
                offers,
            )
        )
    total_pages = math.ceil(total / pagination.page_size) if total else 0
    return CommunityRequestListResponse(
        items=out,
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
    )


@router.get("/requests/{request_id}", response_model=CommunityRequestResponse)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
) -> CommunityRequestResponse:
    req = community_service.get_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
    author = db.query(User).filter(User.id == req.author_id).first()
    offers = []
    for o in req.offers:
        o_author = db.query(User).filter(User.id == o.author_id).first()
        offers.append(_offer_to_response(o, o_author.full_name if o_author else "Unknown"))
    return _request_to_response(req, author.full_name if author else "Unknown", offers)


@router.post("/requests", response_model=CommunityRequestResponse, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: CreateCommunityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommunityRequestResponse:
    req = community_service.create_request(
        db,
        author_id=current_user.id,
        title=payload.title,
        description=payload.description,
        tags=payload.tags,
    )
    return _request_to_response(req, current_user.full_name, [])


@router.post("/requests/{request_id}/offers", response_model=CommunityRequestResponse)
def add_offer(
    request_id: int,
    payload: CreateCommunityOffer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommunityRequestResponse:
    try:
        community_service.add_offer(
            db,
            request_id=request_id,
            author_id=current_user.id,
            note=payload.note,
            file_name=payload.file_name,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    req = community_service.get_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
    author = db.query(User).filter(User.id == req.author_id).first()
    offers = []
    for o in req.offers:
        o_author = db.query(User).filter(User.id == o.author_id).first()
        offers.append(_offer_to_response(o, o_author.full_name if o_author else "Unknown"))
    return _request_to_response(req, author.full_name if author else "Unknown", offers)


@router.post("/requests/{request_id}/fulfill", response_model=CommunityRequestResponse)
def fulfill_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CommunityRequestResponse:
    req = community_service.get_request(db, request_id)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")
    if req.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the request author can mark it as fulfilled.",
        )
    community_service.mark_fulfilled(db, request_id)
    req = community_service.get_request(db, request_id)
    author = db.query(User).filter(User.id == req.author_id).first()
    offers = []
    for o in req.offers:
        o_author = db.query(User).filter(User.id == o.author_id).first()
        offers.append(_offer_to_response(o, o_author.full_name if o_author else "Unknown"))
    return _request_to_response(req, author.full_name if author else "Unknown", offers)
