"""API-level tests for the /api/v1/folders endpoints."""

USER = {"X-User-Id": "user-1"}
OTHER_USER = {"X-User-Id": "user-2"}


def test_create_folder_requires_user_id_header(client):
    response = client.post("/api/v1/folders", json={"name": "Docs"})
    assert response.status_code == 401


def test_create_folder(client):
    response = client.post("/api/v1/folders", json={"name": "Docs"}, headers=USER)
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Docs"
    assert body["owner_id"] == "user-1"
    assert body["parent_folder_id"] is None


def test_create_nested_folder(client):
    parent = client.post("/api/v1/folders", json={"name": "Parent"}, headers=USER).json()
    child = client.post(
        "/api/v1/folders",
        json={"name": "Child", "parent_folder_id": parent["id"]},
        headers=USER,
    ).json()
    assert child["parent_folder_id"] == parent["id"]


def test_create_folder_nonexistent_parent_returns_404(client):
    response = client.post(
        "/api/v1/folders", json={"name": "Orphan", "parent_folder_id": 9999}, headers=USER
    )
    assert response.status_code == 404


def test_get_folder(client):
    created = client.post("/api/v1/folders", json={"name": "Docs"}, headers=USER).json()
    response = client.get(f"/api/v1/folders/{created['id']}", headers=USER)
    assert response.status_code == 200
    assert response.json()["name"] == "Docs"


def test_get_folder_not_found(client):
    response = client.get("/api/v1/folders/9999", headers=USER)
    assert response.status_code == 404


def test_users_cannot_see_each_others_folders(client):
    created = client.post("/api/v1/folders", json={"name": "Private"}, headers=USER).json()
    response = client.get(f"/api/v1/folders/{created['id']}", headers=OTHER_USER)
    assert response.status_code == 404


def test_list_folders_at_root(client):
    client.post("/api/v1/folders", json={"name": "A"}, headers=USER)
    client.post("/api/v1/folders", json={"name": "B"}, headers=USER)
    response = client.get("/api/v1/folders", headers=USER)
    assert response.status_code == 200
    body = response.json()
    assert body["total_items"] == 2
    names = {item["name"] for item in body["items"]}
    assert names == {"A", "B"}


def test_rename_folder(client):
    created = client.post("/api/v1/folders", json={"name": "Old"}, headers=USER).json()
    response = client.patch(
        f"/api/v1/folders/{created['id']}", json={"name": "New"}, headers=USER
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New"


def test_move_folder_to_new_parent(client):
    parent_a = client.post("/api/v1/folders", json={"name": "A"}, headers=USER).json()
    parent_b = client.post("/api/v1/folders", json={"name": "B"}, headers=USER).json()
    child = client.post(
        "/api/v1/folders",
        json={"name": "Child", "parent_folder_id": parent_a["id"]},
        headers=USER,
    ).json()

    response = client.patch(
        f"/api/v1/folders/{child['id']}",
        json={"parent_folder_id": parent_b["id"]},
        headers=USER,
    )
    assert response.status_code == 200
    assert response.json()["parent_folder_id"] == parent_b["id"]


def test_move_folder_to_root(client):
    parent = client.post("/api/v1/folders", json={"name": "Parent"}, headers=USER).json()
    child = client.post(
        "/api/v1/folders",
        json={"name": "Child", "parent_folder_id": parent["id"]},
        headers=USER,
    ).json()
    response = client.patch(
        f"/api/v1/folders/{child['id']}", json={"move_to_root": True}, headers=USER
    )
    assert response.status_code == 200
    assert response.json()["parent_folder_id"] is None


def test_folder_cannot_be_its_own_parent(client):
    created = client.post("/api/v1/folders", json={"name": "Loop"}, headers=USER).json()
    response = client.patch(
        f"/api/v1/folders/{created['id']}",
        json={"parent_folder_id": created["id"]},
        headers=USER,
    )
    assert response.status_code == 400


def test_delete_empty_folder(client):
    created = client.post("/api/v1/folders", json={"name": "Temp"}, headers=USER).json()
    response = client.delete(f"/api/v1/folders/{created['id']}", headers=USER)
    assert response.status_code == 204
    assert client.get(f"/api/v1/folders/{created['id']}", headers=USER).status_code == 404


def test_delete_nonempty_folder_rejected(client):
    parent = client.post("/api/v1/folders", json={"name": "Parent"}, headers=USER).json()
    client.post(
        "/api/v1/folders", json={"name": "Child", "parent_folder_id": parent["id"]}, headers=USER
    )
    response = client.delete(f"/api/v1/folders/{parent['id']}", headers=USER)
    assert response.status_code == 400
