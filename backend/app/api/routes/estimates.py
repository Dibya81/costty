"""Print cost estimate endpoints."""

import math

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_user, get_db, get_pagination
from app.core.config import Settings, get_settings
from app.models.estimate import PrintEstimate
from app.models.user import User
from app.repositories import estimate_repository
from app.schemas.estimate import (
    EstimateCreateRequest,
    EstimateListResponse,
    EstimateResponse,
)
from app.services import pricing_service
from app.services.cost_calculator import (
    InvalidPrintParametersError,
    calculate_print_cost,
)

router = APIRouter(prefix="/api/v1/estimates", tags=["Estimates"])


@router.post(
    "",
    response_model=EstimateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate and save a print cost estimate",
    description=(
        "Accepts print requirements (page count, copies, color mode, print type) "
        "and returns a structured cost breakdown. The estimate is persisted and "
        "can be retrieved later via its `estimate_id`."
    ),
    responses={
        422: {"description": "Validation error in the request body."},
        400: {"description": "Invalid print parameters rejected by the calculation engine."},
    },
)
def create_estimate(
    payload: EstimateCreateRequest,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    current_user: User = Depends(get_current_user),
) -> EstimateResponse:
    pricing_service.ensure_default_rates_seeded(db, settings)
    rates = pricing_service.get_rates_as_decimals(db)

    try:
        result = calculate_print_cost(
            page_count=payload.page_count,
            copies=payload.copies,
            color_mode=payload.color_mode,
            print_type=payload.print_type,
            bw_simplex_price=rates.get("bw_simplex", settings.bw_simplex_price),
            bw_duplex_price=rates.get("bw_duplex", settings.bw_duplex_price),
            color_simplex_price=rates.get("color_simplex", settings.color_simplex_price),
            color_duplex_price=rates.get("color_duplex", settings.color_duplex_price),
        )
    except InvalidPrintParametersError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    estimate = PrintEstimate(
        page_count=result.page_count,
        copies=result.copies,
        color_mode=result.color_mode.value,
        print_type=result.print_type.value,
        price_per_printed_side=result.price_per_printed_side,
        printed_sides_per_copy=result.printed_sides_per_copy,
        physical_sheets_per_copy=result.physical_sheets_per_copy,
        total_printed_sides=result.total_printed_sides,
        total_physical_sheets=result.total_physical_sheets,
        cost_per_copy=result.cost_per_copy,
        total_cost=result.total_cost,
        currency=settings.currency,
    )
    saved = estimate_repository.create_estimate(db, estimate)

    return _to_response(saved)


@router.get(
    "/{estimate_id}",
    response_model=EstimateResponse,
    summary="Retrieve a previously calculated estimate",
    responses={404: {"description": "No estimate found with the given ID."}},
)
def get_estimate(estimate_id: int, db: Session = Depends(get_db)) -> EstimateResponse:
    estimate = estimate_repository.get_estimate_by_id(db, estimate_id)
    if estimate is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Estimate with id {estimate_id} not found.",
        )
    return _to_response(estimate)


@router.get(
    "",
    response_model=EstimateListResponse,
    summary="List estimates",
    description="Returns a paginated list of previously calculated estimates, newest first.",
)
def list_estimates(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
) -> EstimateListResponse:
    items, total = estimate_repository.list_estimates(
        db, offset=pagination.offset, limit=pagination.page_size
    )
    total_pages = math.ceil(total / pagination.page_size) if total else 0

    return EstimateListResponse(
        items=[_to_response(item) for item in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
    )


def _to_response(estimate: PrintEstimate) -> EstimateResponse:
    return EstimateResponse(
        estimate_id=estimate.id,
        page_count=estimate.page_count,
        copies=estimate.copies,
        color_mode=estimate.color_mode,
        print_type=estimate.print_type,
        printed_sides_per_copy=estimate.printed_sides_per_copy,
        physical_sheets_per_copy=estimate.physical_sheets_per_copy,
        total_printed_sides=estimate.total_printed_sides,
        total_physical_sheets=estimate.total_physical_sheets,
        price_per_printed_side=estimate.price_per_printed_side,
        cost_per_copy=estimate.cost_per_copy,
        total_cost=estimate.total_cost,
        currency=estimate.currency,
        created_at=estimate.created_at,
    )
