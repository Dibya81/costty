"""Share-link service layer."""

import secrets
import string

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.errors import NotFoundError
from app.models.file import FileRecord
from app.models.share import ShareLink


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _generate_slug() -> str:
    return secrets.token_urlsafe(10).rstrip("=")[:12]


def create_share(
    db: Session,
    file_id: int,
    owner_id: str,
    permission: str,
    password: str | None,
    expires_in_hours: int | None,
) -> ShareLink:
    """Create a new share link scoped to *owner_id*."""
    file_record = db.query(FileRecord).filter(FileRecord.id == file_id, FileRecord.owner_id == owner_id).first()
    if file_record is None:
        raise NotFoundError("File not found.")

    link = ShareLink(
        slug=_generate_slug(),
        file_id=file_id,
        owner_id=owner_id,
        permission=permission,
        password_hash=password,
        expires_at=_now() + timedelta(hours=expires_in_hours) if expires_in_hours else None,
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def list_shares(db: Session, owner_id: str, offset: int, limit: int) -> tuple[list[ShareLink], int]:
    query = db.query(ShareLink).filter(ShareLink.owner_id == owner_id).order_by(ShareLink.created_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def revoke_share(db: Session, link_id: int, owner_id: str) -> ShareLink:
    link = db.query(ShareLink).filter(ShareLink.id == link_id, ShareLink.owner_id == owner_id).first()
    if link is None:
        raise NotFoundError("Share link not found.")
    link.revoked = True
    db.commit()
    db.refresh(link)
    return link


def resolve_public_share(db: Session, slug: str, password: str | None = None) -> ShareLink | None:
    link = db.query(ShareLink).filter(ShareLink.slug == slug).first()
    if link is None:
        return None
    if link.revoked:
        return None
    if link.expires_at and link.expires_at < _now():
        return None
    if link.password_hash and password != link.password_hash:
        return None
    link.view_count += 1
    db.commit()
    db.refresh(link)
    return link
