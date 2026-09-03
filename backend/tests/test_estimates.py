"""API-level tests for the /api/v1/estimates endpoints."""


def test_create_estimate_bw_duplex_returns_correct_breakdown(client):
    payload = {
        "page_count": 100,
        "copies": 2,
        "color_mode": "bw",
        "print_type": "duplex",
    }
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 201

    body = response.json()
    assert body["page_count"] == 100
    assert body["copies"] == 2
    assert body["color_mode"] == "bw"
    assert body["print_type"] == "duplex"
    assert body["printed_sides_per_copy"] == 100
    assert body["physical_sheets_per_copy"] == 50
    assert body["total_printed_sides"] == 200
    assert body["total_physical_sheets"] == 100
    assert float(body["price_per_printed_side"]) == 1.50
    assert float(body["cost_per_copy"]) == 150.00
    assert float(body["total_cost"]) == 300.00
    assert body["currency"] == "INR"
    assert "estimate_id" in body
    assert "created_at" in body


def test_create_estimate_color_simplex(client):
    payload = {
        "page_count": 50,
        "copies": 3,
        "color_mode": "color",
        "print_type": "simplex",
    }
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["printed_sides_per_copy"] == 50
    assert body["physical_sheets_per_copy"] == 50
    assert float(body["cost_per_copy"]) == 500.00
    assert float(body["total_cost"]) == 1500.00


def test_create_estimate_odd_page_count_duplex(client):
    payload = {
        "page_count": 101,
        "copies": 1,
        "color_mode": "bw",
        "print_type": "duplex",
    }
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["physical_sheets_per_copy"] == 51
    assert float(body["total_cost"]) == 151.50


def test_create_estimate_rejects_zero_page_count(client):
    payload = {"page_count": 0, "copies": 1, "color_mode": "bw", "print_type": "simplex"}
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 422


def test_create_estimate_rejects_negative_page_count(client):
    payload = {"page_count": -5, "copies": 1, "color_mode": "bw", "print_type": "simplex"}
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 422


def test_create_estimate_rejects_zero_copies(client):
    payload = {"page_count": 10, "copies": 0, "color_mode": "bw", "print_type": "simplex"}
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 422


def test_create_estimate_rejects_negative_copies(client):
    payload = {"page_count": 10, "copies": -2, "color_mode": "bw", "print_type": "simplex"}
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 422


def test_create_estimate_rejects_invalid_color_mode(client):
    payload = {"page_count": 10, "copies": 1, "color_mode": "sepia", "print_type": "simplex"}
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 422


def test_create_estimate_rejects_invalid_print_type(client):
    payload = {"page_count": 10, "copies": 1, "color_mode": "bw", "print_type": "triplex"}
    response = client.post("/api/v1/estimates", json=payload)
    assert response.status_code == 422


def test_create_estimate_rejects_missing_fields(client):
    response = client.post("/api/v1/estimates", json={"page_count": 10})
    assert response.status_code == 422


def test_get_estimate_returns_previously_created_estimate(client):
    create_resp = client.post(
        "/api/v1/estimates",
        json={"page_count": 20, "copies": 1, "color_mode": "bw", "print_type": "simplex"},
    )
    estimate_id = create_resp.json()["estimate_id"]

    get_resp = client.get(f"/api/v1/estimates/{estimate_id}")
    assert get_resp.status_code == 200
    body = get_resp.json()
    assert body["estimate_id"] == estimate_id
    assert body["page_count"] == 20


def test_get_estimate_returns_404_for_nonexistent_id(client):
    response = client.get("/api/v1/estimates/999999")
    assert response.status_code == 404


def test_list_estimates_returns_created_items(client):
    for _ in range(3):
        client.post(
            "/api/v1/estimates",
            json={"page_count": 10, "copies": 1, "color_mode": "bw", "print_type": "simplex"},
        )

    response = client.get("/api/v1/estimates")
    assert response.status_code == 200
    body = response.json()
    assert body["total_items"] == 3
    assert len(body["items"]) == 3
    assert body["page"] == 1


def test_list_estimates_pagination(client):
    for _ in range(5):
        client.post(
            "/api/v1/estimates",
            json={"page_count": 10, "copies": 1, "color_mode": "bw", "print_type": "simplex"},
        )

    response = client.get("/api/v1/estimates?page=1&page_size=2")
    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 2
    assert body["page_size"] == 2
    assert body["total_items"] == 5
    assert body["total_pages"] == 3

    response_page_2 = client.get("/api/v1/estimates?page=2&page_size=2")
    body_page_2 = response_page_2.json()
    assert len(body_page_2["items"]) == 2

    # Ensure pages don't overlap.
    ids_page_1 = {item["estimate_id"] for item in body["items"]}
    ids_page_2 = {item["estimate_id"] for item in body_page_2["items"]}
    assert ids_page_1.isdisjoint(ids_page_2)


def test_list_estimates_empty(client):
    response = client.get("/api/v1/estimates")
    assert response.status_code == 200
    body = response.json()
    assert body["items"] == []
    assert body["total_items"] == 0
    assert body["total_pages"] == 0
