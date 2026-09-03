"""
Data access layer for pricing rates.

`app.services.pricing_service` currently performs its own queries directly
since they are simple, single-table operations; this module exists to keep
the layered architecture explicit and gives a clear place to add more
complex pricing queries (e.g. historical rate lookups) later without
touching the service layer's public interface.
"""

from sqlalchemy.orm import Session

from app.models.pricing import PricingRate


def get_all(db: Session) -> list[PricingRate]:
    return db.query(PricingRate).order_by(PricingRate.key).all()


def get_by_key(db: Session, key: str) -> PricingRate | None:
    return db.query(PricingRate).filter(PricingRate.key == key).first()
