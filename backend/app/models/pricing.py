"""ORM model for database-backed pricing configuration.

Storing pricing in the database (seeded from environment defaults on first
run) allows rates to be changed at runtime via the admin pricing endpoint
without any source-code or redeploy step.
"""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

MONEY = Numeric(precision=12, scale=2)


class PricingRate(Base):
    __tablename__ = "pricing_rates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # A unique key such as "bw_simplex", "bw_duplex", "color_simplex",
    # "color_duplex" identifies each rate row.
    key: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)

    color_mode: Mapped[str] = mapped_column(String(10), nullable=False)
    print_type: Mapped[str] = mapped_column(String(10), nullable=False)

    price_per_printed_side: Mapped[object] = mapped_column(MONEY, nullable=False)

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
