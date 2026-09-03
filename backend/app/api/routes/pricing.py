"""Pricing configuration endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db, require_admin
from app.core.config import Settings, get_settings
from app.schemas.pricing import (
    PricingConfigResponse,
    PricingRateResponse,
    PricingUpdateRequest,
)
from app.services import pricing_service

router = APIRouter(prefix="/api/v1/pricing", tags=["Pricing"])


@router.get(
    "",
    response_model=PricingConfigResponse,
    summary="Get current pricing configuration",
    description="Returns the currently configured per-side rates for every color mode / print type combination.",
)
def get_pricing(
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> PricingConfigResponse:
    pricing_service.ensure_default_rates_seeded(db, settings)
    rates = pricing_service.get_all_rates(db)
    return PricingConfigResponse(
        currency=settings.currency,
        rates=[PricingRateResponse.model_validate(r) for r in rates],
    )


@router.put(
    "",
    response_model=PricingRateResponse,
    summary="Update a pricing rate (admin only)",
    description=(
        "**Administrative operation.** Updates the price per printed side for a "
        "given color mode / print type combination. Requires the `X-Admin-API-Key` "
        "header to match the server's configured admin key."
    ),
    dependencies=[Depends(require_admin)],
)
def update_pricing(
    payload: PricingUpdateRequest,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> PricingRateResponse:
    pricing_service.ensure_default_rates_seeded(db, settings)
    rate = pricing_service.upsert_rate(
        db,
        color_mode=payload.color_mode,
        print_type=payload.print_type,
        price=payload.price_per_printed_side,
    )
    return PricingRateResponse.model_validate(rate)
