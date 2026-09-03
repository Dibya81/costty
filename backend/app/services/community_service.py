"""Community request / offer service layer."""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.community import CommunityOffer, CommunityRequest
from app.models.user import User


def _now() -> datetime:
    return datetime.now(timezone.utc)


def list_requests(
    db: Session,
    page: int,
    page_size: int,
    search: str | None = None,
    status: str | None = None,
) -> tuple[list[CommunityRequest], int]:
    query = db.query(CommunityRequest).order_by(CommunityRequest.created_at.desc())
    if search:
        term = f"%{search}%"
        query = query.filter(
            (CommunityRequest.title.ilike(term))
            | (CommunityRequest.tags.ilike(term))
            | (CommunityRequest.description.ilike(term))
        )
    if status:
        query = query.filter(CommunityRequest.status == status)
    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    return items, total


def get_request(db: Session, request_id: int) -> CommunityRequest | None:
    return db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()


def create_request(db: Session, author_id: int, title: str, description: str, tags: list[str]) -> CommunityRequest:
    req = CommunityRequest(
        author_id=author_id,
        title=title,
        description=description,
        tags=",".join(tags),
        status="open",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def add_offer(db: Session, request_id: int, author_id: int, note: str, file_name: str | None) -> CommunityOffer:
    req = db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()
    if req is None:
        raise NotFoundError("Request not found.")
    offer = CommunityOffer(
        request_id=request_id,
        author_id=author_id,
        note=note,
        file_name=file_name,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


def mark_fulfilled(db: Session, request_id: int) -> CommunityRequest | None:
    req = db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()
    if req is None:
        return None
    req.status = "fulfilled"
    db.commit()
    db.refresh(req)
    return req


def get_stats(db: Session) -> dict:
    total = db.query(CommunityRequest).count()
    open_count = db.query(CommunityRequest).filter(CommunityRequest.status == "open").count()
    fulfilled_count = db.query(CommunityRequest).filter(CommunityRequest.status == "fulfilled").count()
    total_offers = db.query(CommunityOffer).count()
    return {
        "total_requests": total,
        "open_requests": open_count,
        "fulfilled_requests": fulfilled_count,
        "total_offers": total_offers,
    }
