"""Pydantic request/response schemas for print estimates."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict

from app.core.enums import ColorMode, PrintType


class EstimateCreateRequest(BaseModel):
    """Request body for creating a new print cost estimate."""

    page_count: int = Field(
        ...,
        gt=0,
        description="Number of pages in the source document.",
        examples=[100],
    )
    copies: int = Field(
        ...,
        gt=0,
        description="Number of copies to print.",
        examples=[2],
    )
    color_mode: ColorMode = Field(
        ...,
        description="Whether to print in color or black & white.",
        examples=["bw"],
    )
    print_type: PrintType = Field(
        ...,
        description="Whether to print single-sided (simplex) or double-sided (duplex).",
        examples=["duplex"],
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "page_count": 100,
                "copies": 2,
                "color_mode": "bw",
                "print_type": "duplex",
            }
        }
    )


class EstimateResponse(BaseModel):
    """Full structured breakdown of a calculated (and persisted) estimate."""

    estimate_id: int
    page_count: int
    copies: int
    color_mode: ColorMode
    print_type: PrintType

    printed_sides_per_copy: int = Field(
        ..., description="Printed sides required for a single copy."
    )
    physical_sheets_per_copy: int = Field(
        ..., description="Physical sheets of paper required for a single copy."
    )

    total_printed_sides: int = Field(
        ..., description="Total printed sides across all copies."
    )
    total_physical_sheets: int = Field(
        ..., description="Total physical sheets across all copies."
    )

    price_per_printed_side: Decimal
    cost_per_copy: Decimal
    total_cost: Decimal
    currency: str

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EstimateListResponse(BaseModel):
    """Paginated list of estimates."""

    items: list[EstimateResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int
