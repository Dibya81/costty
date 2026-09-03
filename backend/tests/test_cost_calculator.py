"""
Unit tests for the pure calculation engine.

These test actual numerical output, not just that a function runs without
error — per the spec's testing requirements.
"""

from decimal import Decimal

import pytest

from app.core.enums import ColorMode, PrintType
from app.services.cost_calculator import (
    InvalidPrintParametersError,
    calculate_physical_sheets,
    calculate_print_cost,
)

BW_SIMPLEX = Decimal("2.00")
BW_DUPLEX = Decimal("1.50")
COLOR_SIMPLEX = Decimal("10.00")
COLOR_DUPLEX = Decimal("8.00")


def _calc(page_count, copies, color_mode, print_type):
    return calculate_print_cost(
        page_count=page_count,
        copies=copies,
        color_mode=color_mode,
        print_type=print_type,
        bw_simplex_price=BW_SIMPLEX,
        bw_duplex_price=BW_DUPLEX,
        color_simplex_price=COLOR_SIMPLEX,
        color_duplex_price=COLOR_DUPLEX,
    )


# --- Spec example: 100 pages, 1 copy, B&W, Simplex ---
def test_bw_simplex_basic_example():
    result = _calc(100, 1, ColorMode.BW, PrintType.SIMPLEX)
    assert result.printed_sides_per_copy == 100
    assert result.physical_sheets_per_copy == 100
    assert result.total_printed_sides == 100
    assert result.total_physical_sheets == 100
    assert result.price_per_printed_side == Decimal("2.00")
    assert result.cost_per_copy == Decimal("200.00")
    assert result.total_cost == Decimal("200.00")


# --- Spec example: 100 pages, 1 copy, B&W, Duplex ---
def test_bw_duplex_basic_example():
    result = _calc(100, 1, ColorMode.BW, PrintType.DUPLEX)
    assert result.printed_sides_per_copy == 100
    assert result.physical_sheets_per_copy == 50
    assert result.cost_per_copy == Decimal("150.00")
    assert result.total_cost == Decimal("150.00")


# --- Spec example: 100 pages, 2 copies, B&W, Duplex (README response example) ---
def test_bw_duplex_two_copies_matches_readme_example():
    result = _calc(100, 2, ColorMode.BW, PrintType.DUPLEX)
    assert result.printed_sides_per_copy == 100
    assert result.physical_sheets_per_copy == 50
    assert result.total_printed_sides == 200
    assert result.total_physical_sheets == 100
    assert result.price_per_printed_side == Decimal("1.50")
    assert result.cost_per_copy == Decimal("150.00")
    assert result.total_cost == Decimal("300.00")


# --- Edge case 1: 1 page, 1 copy, B&W, Simplex ---
def test_edge_case_single_page_simplex():
    result = _calc(1, 1, ColorMode.BW, PrintType.SIMPLEX)
    assert result.printed_sides_per_copy == 1
    assert result.physical_sheets_per_copy == 1
    assert result.cost_per_copy == Decimal("2.00")
    assert result.total_cost == Decimal("2.00")


# --- Edge case 2: 1 page, 1 copy, B&W, Duplex (single sheet, single-sided) ---
def test_edge_case_single_page_duplex():
    result = _calc(1, 1, ColorMode.BW, PrintType.DUPLEX)
    assert result.printed_sides_per_copy == 1
    assert result.physical_sheets_per_copy == 1  # one sheet, printed on one side only
    assert result.cost_per_copy == Decimal("1.50")
    assert result.total_cost == Decimal("1.50")


# --- Edge case 3: 101 pages, 1 copy, B&W, Duplex (odd page count) ---
def test_edge_case_odd_page_count_duplex():
    result = _calc(101, 1, ColorMode.BW, PrintType.DUPLEX)
    assert result.printed_sides_per_copy == 101
    assert result.physical_sheets_per_copy == 51  # 50 full duplex sheets + 1 single-sided
    assert result.cost_per_copy == Decimal("151.50")
    assert result.total_cost == Decimal("151.50")


# --- Edge case 4: 100 pages, 5 copies, Color, Simplex ---
def test_edge_case_color_simplex_multiple_copies():
    result = _calc(100, 5, ColorMode.COLOR, PrintType.SIMPLEX)
    assert result.printed_sides_per_copy == 100
    assert result.physical_sheets_per_copy == 100
    assert result.total_printed_sides == 500
    assert result.total_physical_sheets == 500
    assert result.price_per_printed_side == Decimal("10.00")
    assert result.cost_per_copy == Decimal("1000.00")
    assert result.total_cost == Decimal("5000.00")


# --- Edge case 5: 100 pages, 5 copies, Color, Duplex ---
def test_edge_case_color_duplex_multiple_copies():
    result = _calc(100, 5, ColorMode.COLOR, PrintType.DUPLEX)
    assert result.printed_sides_per_copy == 100
    assert result.physical_sheets_per_copy == 50
    assert result.total_printed_sides == 500
    assert result.total_physical_sheets == 250
    assert result.price_per_printed_side == Decimal("8.00")
    assert result.cost_per_copy == Decimal("800.00")
    assert result.total_cost == Decimal("4000.00")


# --- Odd page count with simplex (no special handling needed, sanity check) ---
def test_odd_page_count_simplex():
    result = _calc(7, 1, ColorMode.BW, PrintType.SIMPLEX)
    assert result.printed_sides_per_copy == 7
    assert result.physical_sheets_per_copy == 7


@pytest.mark.parametrize("page_count", [0, -1, -100])
def test_invalid_page_count_raises(page_count):
    with pytest.raises(InvalidPrintParametersError):
        _calc(page_count, 1, ColorMode.BW, PrintType.SIMPLEX)


@pytest.mark.parametrize("copies", [0, -1, -50])
def test_invalid_copies_raises(copies):
    with pytest.raises(InvalidPrintParametersError):
        _calc(100, copies, ColorMode.BW, PrintType.SIMPLEX)


def test_page_count_over_max_raises():
    with pytest.raises(InvalidPrintParametersError):
        _calc(10_000_000, 1, ColorMode.BW, PrintType.SIMPLEX)


def test_copies_over_max_raises():
    with pytest.raises(InvalidPrintParametersError):
        _calc(100, 10_000_000, ColorMode.BW, PrintType.SIMPLEX)


def test_large_but_reasonable_values_do_not_error():
    result = _calc(50_000, 100, ColorMode.COLOR, PrintType.DUPLEX)
    assert result.total_printed_sides == 50_000 * 100
    assert result.total_physical_sheets == 25_000 * 100


@pytest.mark.parametrize(
    "page_count,expected_sheets",
    [(1, 1), (2, 1), (3, 2), (4, 2), (99, 50), (100, 50), (101, 51)],
)
def test_calculate_physical_sheets_duplex_rounding(page_count, expected_sheets):
    assert calculate_physical_sheets(page_count, PrintType.DUPLEX) == expected_sheets


def test_calculate_physical_sheets_simplex_equals_page_count():
    assert calculate_physical_sheets(250, PrintType.SIMPLEX) == 250
