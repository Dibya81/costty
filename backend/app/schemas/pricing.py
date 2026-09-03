"""Pydantic request/response schemas for pricing configuration."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import ColorMode, PrintType


class PricingRateResponse(BaseModel):
    key: str
    color_mode: ColorMode
    print_type: PrintType
    price_per_printed_side: Decimal
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PricingConfigResponse(BaseModel):
    """All currently configured rates, plus the active currency."""

    currency: str
    rates: list[PricingRateResponse]


class PricingUpdateRequest(BaseModel):
    """Admin-only request body to update a single rate."""

    color_mode: ColorMode
    print_type: PrintType
    price_per_printed_side: Decimal = Field(..., gt=0)
