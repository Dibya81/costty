"""
Pure print-cost calculation engine.

This module has no dependency on FastAPI, the database, or any I/O — it
takes plain values in and returns a plain, structured result. This makes it
trivially unit-testable and safe to reuse from other contexts (e.g. a CLI,
a background job, or a different API version) without modification.
"""

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP

from app.core.enums import ColorMode, PrintType

# A sane upper bound to guard against unreasonable resource usage / overflow
# from pathological input (e.g. someone passing page_count=10_000_000_000).
MAX_PAGE_COUNT = 100_000
MAX_COPIES = 100_000

# Cents-level rounding for all monetary output.
_CENT = Decimal("0.01")


class InvalidPrintParametersError(ValueError):
    """Raised when print parameters fail validation inside the calculation engine."""


@dataclass(frozen=True)
class CostCalculationResult:
    """Structured result of a print cost calculation."""

    page_count: int
    copies: int
    color_mode: ColorMode
    print_type: PrintType

    price_per_printed_side: Decimal

    printed_sides_per_copy: int
    physical_sheets_per_copy: int

    total_printed_sides: int
    total_physical_sheets: int

    cost_per_copy: Decimal
    total_cost: Decimal


def _round_money(value: Decimal) -> Decimal:
    """Round a Decimal to 2 decimal places using standard half-up rounding."""
    return value.quantize(_CENT, rounding=ROUND_HALF_UP)


def _validate_parameters(page_count: int, copies: int) -> None:
    if page_count <= 0:
        raise InvalidPrintParametersError("page_count must be greater than 0.")
    if copies <= 0:
        raise InvalidPrintParametersError("copies must be greater than 0.")
    if page_count > MAX_PAGE_COUNT:
        raise InvalidPrintParametersError(
            f"page_count must not exceed {MAX_PAGE_COUNT}."
        )
    if copies > MAX_COPIES:
        raise InvalidPrintParametersError(f"copies must not exceed {MAX_COPIES}.")


def calculate_physical_sheets(page_count: int, print_type: PrintType) -> int:
    """
    Number of physical sheets needed to print `page_count` document pages.

    Simplex: one document page per physical sheet.
    Duplex: two document pages per physical sheet, rounded up — an odd page
    count leaves one final sheet printed on a single side.
    """
    if print_type == PrintType.SIMPLEX:
        return page_count
    # Duplex: ceiling division by 2.
    return (page_count + 1) // 2


def calculate_printed_sides(page_count: int, print_type: PrintType) -> int:
    """
    Number of printed *sides* required for `page_count` document pages.

    Every document page corresponds to exactly one printed side, regardless
    of simplex/duplex — duplex only changes how many sides share a sheet,
    not how many sides get ink on them.
    """
    return page_count


def get_price_per_side(
    color_mode: ColorMode,
    print_type: PrintType,
    bw_simplex_price: Decimal,
    bw_duplex_price: Decimal,
    color_simplex_price: Decimal,
    color_duplex_price: Decimal,
) -> Decimal:
    """Resolve the applicable price-per-printed-side for the given options."""
    if color_mode == ColorMode.BW and print_type == PrintType.SIMPLEX:
        return bw_simplex_price
    if color_mode == ColorMode.BW and print_type == PrintType.DUPLEX:
        return bw_duplex_price
    if color_mode == ColorMode.COLOR and print_type == PrintType.SIMPLEX:
        return color_simplex_price
    if color_mode == ColorMode.COLOR and print_type == PrintType.DUPLEX:
        return color_duplex_price
    # Unreachable given the ColorMode/PrintType enums, but kept for safety.
    raise InvalidPrintParametersError(
        f"No price configured for color_mode={color_mode}, print_type={print_type}."
    )


def calculate_print_cost(
    *,
    page_count: int,
    copies: int,
    color_mode: ColorMode,
    print_type: PrintType,
    bw_simplex_price: Decimal,
    bw_duplex_price: Decimal,
    color_simplex_price: Decimal,
    color_duplex_price: Decimal,
) -> CostCalculationResult:
    """
    Calculate a full, structured print cost breakdown.

    Steps:
      1. Validate the print parameters.
      2. Determine the applicable price per printed side.
      3. Calculate printed sides (per copy and total).
      4. Calculate physical sheets (per copy and total).
      5. Calculate cost per copy.
      6. Multiply by number of copies for the total cost.
      7. Return a structured result.
    """
    _validate_parameters(page_count, copies)

    price_per_side = get_price_per_side(
        color_mode=color_mode,
        print_type=print_type,
        bw_simplex_price=bw_simplex_price,
        bw_duplex_price=bw_duplex_price,
        color_simplex_price=color_simplex_price,
        color_duplex_price=color_duplex_price,
    )

    printed_sides_per_copy = calculate_printed_sides(page_count, print_type)
    physical_sheets_per_copy = calculate_physical_sheets(page_count, print_type)

    total_printed_sides = printed_sides_per_copy * copies
    total_physical_sheets = physical_sheets_per_copy * copies

    cost_per_copy = _round_money(Decimal(printed_sides_per_copy) * price_per_side)
    total_cost = _round_money(cost_per_copy * copies)

    return CostCalculationResult(
        page_count=page_count,
        copies=copies,
        color_mode=color_mode,
        print_type=print_type,
        price_per_printed_side=price_per_side,
        printed_sides_per_copy=printed_sides_per_copy,
        physical_sheets_per_copy=physical_sheets_per_copy,
        total_printed_sides=total_printed_sides,
        total_physical_sheets=total_physical_sheets,
        cost_per_copy=cost_per_copy,
        total_cost=total_cost,
    )
