"""API-level tests for the /api/v1/pricing endpoints."""

from app.core.config import get_settings

ADMIN_KEY = get_settings().admin_api_key


def test_get_pricing_returns_all_four_rates(client):
    response = client.get("/api/v1/pricing")
    assert response.status_code == 200
    body = response.json()
    assert body["currency"] == "INR"
    keys = {rate["key"] for rate in body["rates"]}
    assert keys == {"bw_simplex", "bw_duplex", "color_simplex", "color_duplex"}


def test_get_pricing_default_values_match_configured_defaults(client):
    response = client.get("/api/v1/pricing")
    body = response.json()
    rates_by_key = {rate["key"]: float(rate["price_per_printed_side"]) for rate in body["rates"]}
    assert rates_by_key["bw_simplex"] == 2.00
    assert rates_by_key["bw_duplex"] == 1.50
    assert rates_by_key["color_simplex"] == 10.00
    assert rates_by_key["color_duplex"] == 8.00


def test_update_pricing_without_admin_key_is_rejected(client):
    response = client.put(
        "/api/v1/pricing",
        json={"color_mode": "bw", "print_type": "simplex", "price_per_printed_side": 3.00},
    )
    assert response.status_code == 401


def test_update_pricing_with_wrong_admin_key_is_rejected(client):
    response = client.put(
        "/api/v1/pricing",
        json={"color_mode": "bw", "print_type": "simplex", "price_per_printed_side": 3.00},
        headers={"X-Admin-API-Key": "wrong-key"},
    )
    assert response.status_code == 401


def test_admin_key_comparison_is_not_bypassed_by_prefix_match(client):
    """A partial/prefix match of the real admin key must still be rejected."""
    real_key = ADMIN_KEY
    prefix_only = real_key[: max(1, len(real_key) // 2)]
    response = client.put(
        "/api/v1/pricing",
        json={"color_mode": "bw", "print_type": "simplex", "price_per_printed_side": 3.00},
        headers={"X-Admin-API-Key": prefix_only},
    )
    assert response.status_code == 401


def test_update_pricing_with_valid_admin_key_succeeds(client):
    response = client.put(
        "/api/v1/pricing",
        json={"color_mode": "bw", "print_type": "simplex", "price_per_printed_side": 3.00},
        headers={"X-Admin-API-Key": ADMIN_KEY},
    )
    assert response.status_code == 200
    body = response.json()
    assert float(body["price_per_printed_side"]) == 3.00
    assert body["key"] == "bw_simplex"


def test_updated_pricing_is_reflected_in_new_estimates(client):
    client.put(
        "/api/v1/pricing",
        json={"color_mode": "bw", "print_type": "simplex", "price_per_printed_side": 5.00},
        headers={"X-Admin-API-Key": ADMIN_KEY},
    )

    response = client.post(
        "/api/v1/estimates",
        json={"page_count": 10, "copies": 1, "color_mode": "bw", "print_type": "simplex"},
    )
    body = response.json()
    assert float(body["price_per_printed_side"]) == 5.00
    assert float(body["total_cost"]) == 50.00
