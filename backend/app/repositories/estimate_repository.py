"""Data access layer for print estimates. No business logic lives here."""

from sqlalchemy.orm import Session

from app.models.estimate import PrintEstimate


def create_estimate(db: Session, estimate: PrintEstimate) -> PrintEstimate:
    db.add(estimate)
    db.commit()
    db.refresh(estimate)
    return estimate


def get_estimate_by_id(db: Session, estimate_id: int) -> PrintEstimate | None:
    return db.query(PrintEstimate).filter(PrintEstimate.id == estimate_id).first()


def list_estimates(db: Session, offset: int, limit: int) -> tuple[list[PrintEstimate], int]:
    """Return a page of estimates (newest first) and the total item count."""
    query = db.query(PrintEstimate).order_by(PrintEstimate.created_at.desc(), PrintEstimate.id.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total
