"""
Pricing configuration service.

Rates are stored in the database (see `app.models.pricing.PricingRate`) so
they can be changed at runtime through the admin pricing endpoint. On first
use, the table is seeded from the environment-configured defaults.
"""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.enums import ColorMode, PrintType
from app.models.pricing import PricingRate

_RATE_DEFINITIONS = [
    ("bw_simplex", ColorMode.BW, PrintType.SIMPLEX, "bw_simplex_price"),
    ("bw_duplex", ColorMode.BW, PrintType.DUPLEX, "bw_duplex_price"),
    ("color_simplex", ColorMode.COLOR, PrintType.SIMPLEX, "color_simplex_price"),
    ("color_duplex", ColorMode.COLOR, PrintType.DUPLEX, "color_duplex_price"),
]


def ensure_default_rates_seeded(db: Session, settings: Settings) -> None:
    """Insert default pricing rows from settings if the table is empty."""
    existing_keys = {row.key for row in db.query(PricingRate.key).all()}

    to_add = []
    for key, color_mode, print_type, settings_attr in _RATE_DEFINITIONS:
        if key in existing_keys:
            continue
        price = getattr(settings, settings_attr)
        to_add.append(
            PricingRate(
                key=key,
                color_mode=color_mode.value,
                print_type=print_type.value,
                price_per_printed_side=price,
            )
        )

    if to_add:
        db.add_all(to_add)
        db.commit()


def get_all_rates(db: Session) -> list[PricingRate]:
    return db.query(PricingRate).order_by(PricingRate.key).all()


def get_rate(db: Session, color_mode: ColorMode, print_type: PrintType) -> PricingRate | None:
    return (
        db.query(PricingRate)
        .filter(
            PricingRate.color_mode == color_mode.value,
            PricingRate.print_type == print_type.value,
        )
        .first()
    )


def get_rates_as_decimals(db: Session) -> dict[str, Decimal]:
    """Return current rates keyed by their pricing-key, as Decimal values."""
    rates = get_all_rates(db)
    return {row.key: Decimal(str(row.price_per_printed_side)) for row in rates}


def upsert_rate(
    db: Session, color_mode: ColorMode, print_type: PrintType, price: Decimal
) -> PricingRate:
    """Create or update the rate for a given color_mode/print_type combination."""
    rate = get_rate(db, color_mode, print_type)
    if rate is None:
        key = f"{color_mode.value}_{print_type.value}"
        rate = PricingRate(
            key=key,
            color_mode=color_mode.value,
            print_type=print_type.value,
            price_per_printed_side=price,
        )
        db.add(rate)
    else:
        rate.price_per_printed_side = price

    db.commit()
    db.refresh(rate)
    return rate
