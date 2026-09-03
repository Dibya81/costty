"""ORM model for a persisted print cost estimate."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# Numeric(10, 2) is used for all monetary values to avoid floating point
# precision issues. Two decimal places is sufficient for currency (paise).
MONEY = Numeric(precision=12, scale=2)


class PrintEstimate(Base):
    __tablename__ = "print_estimates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # --- Input parameters ---
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    copies: Mapped[int] = mapped_column(Integer, nullable=False)
    color_mode: Mapped[str] = mapped_column(String(10), nullable=False)
    print_type: Mapped[str] = mapped_column(String(10), nullable=False)

    # --- Calculation results ---
    price_per_printed_side: Mapped[object] = mapped_column(MONEY, nullable=False)

    printed_sides_per_copy: Mapped[int] = mapped_column(Integer, nullable=False)
    physical_sheets_per_copy: Mapped[int] = mapped_column(Integer, nullable=False)

    total_printed_sides: Mapped[int] = mapped_column(Integer, nullable=False)
    total_physical_sheets: Mapped[int] = mapped_column(Integer, nullable=False)

    cost_per_copy: Mapped[object] = mapped_column(MONEY, nullable=False)
    total_cost: Mapped[object] = mapped_column(MONEY, nullable=False)

    currency: Mapped[str] = mapped_column(String(8), nullable=False, default="INR")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
