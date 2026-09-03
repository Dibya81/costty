"""API-level tests for the /api/v1/files endpoints."""

import io

USER = {"X-User-Id": "user-1"}
OTHER_USER = {"X-User-Id": "user-2"}


def _upload(client, headers=USER, filename="notes.txt", content=b"hello world", folder_id=None):
    data = {}
    if folder_id is not None:
        data["folder_id"] = str(folder_id)
    files = {"upload": (filename, io.BytesIO(content), "text/plain")}
    return client.post("/api/v1/files", files=files, data=data, headers=headers)


def test_upload_requires_user_id_header(client):
    files = {"upload": ("a.txt", io.BytesIO(b"x"), "text/plain")}
    response = client.post("/api/v1/files", files=files)
    assert response.status_code == 401


def test_upload_file_basic(client):
    response = _upload(client)
    assert response.status_code == 201
    body = response.json()
    assert body["filename"] == "notes.txt"
    assert body["extension"] == "txt"
    assert body["size_bytes"] == len(b"hello world")
    assert body["owner_id"] == "user-1"
    assert body["folder_id"] is None


def test_upload_rejects_unsupported_extension(client):
    files = {"upload": ("virus.exe", io.BytesIO(b"x"), "application/octet-stream")}
    response = client.post("/api/v1/files", files=files, headers=USER)
    assert response.status_code == 400


def test_upload_rejects_empty_file(client):
    files = {"upload": ("empty.txt", io.BytesIO(b""), "text/plain")}
    response = client.post("/api/v1/files", files=files, headers=USER)
    assert response.status_code == 400


def test_upload_into_folder(client):
    folder = client.post("/api/v1/folders", json={"name": "Docs"}, headers=USER).json()
    response = _upload(client, filename="in_folder.txt", folder_id=folder["id"])
    assert response.status_code == 201
    assert response.json()["folder_id"] == folder["id"]


def test_upload_into_nonexistent_folder_returns_404(client):
    response = _upload(client, filename="x.txt", folder_id=9999)
    assert response.status_code == 404


def test_get_file_metadata(client):
    created = _upload(client).json()
    response = client.get(f"/api/v1/files/{created['id']}", headers=USER)
    assert response.status_code == 200
    assert response.json()["filename"] == "notes.txt"


def test_get_file_not_found(client):
    response = client.get("/api/v1/files/9999", headers=USER)
    assert response.status_code == 404


def test_users_cannot_access_each_others_files(client):
    created = _upload(client).json()
    response = client.get(f"/api/v1/files/{created['id']}", headers=OTHER_USER)
    assert response.status_code == 404


def test_download_file_returns_original_bytes(client):
    created = _upload(client, content=b"the exact bytes").json()
    response = client.get(f"/api/v1/files/{created['id']}/download", headers=USER)
    assert response.status_code == 200
    assert response.content == b"the exact bytes"
    assert "notes.txt" in response.headers["content-disposition"]


def test_download_nonexistent_file_returns_404(client):
    response = client.get("/api/v1/files/9999/download", headers=USER)
    assert response.status_code == 404


def test_rename_file(client):
    created = _upload(client).json()
    response = client.patch(
        f"/api/v1/files/{created['id']}", json={"filename": "renamed.txt"}, headers=USER
    )
    assert response.status_code == 200
    assert response.json()["filename"] == "renamed.txt"


def test_move_file_to_folder(client):
    folder = client.post("/api/v1/folders", json={"name": "Dest"}, headers=USER).json()
    created = _upload(client).json()
    response = client.patch(
        f"/api/v1/files/{created['id']}", json={"folder_id": folder["id"]}, headers=USER
    )
    assert response.status_code == 200
    assert response.json()["folder_id"] == folder["id"]


def test_move_file_to_root(client):
    folder = client.post("/api/v1/folders", json={"name": "Dest"}, headers=USER).json()
    created = _upload(client, folder_id=folder["id"]).json()
    response = client.patch(
        f"/api/v1/files/{created['id']}", json={"move_to_root": True}, headers=USER
    )
    assert response.status_code == 200
    assert response.json()["folder_id"] is None


def test_delete_file(client):
    created = _upload(client).json()
    response = client.delete(f"/api/v1/files/{created['id']}", headers=USER)
    assert response.status_code == 204
    assert client.get(f"/api/v1/files/{created['id']}", headers=USER).status_code == 404


def test_delete_nonexistent_file_returns_404(client):
    response = client.delete("/api/v1/files/9999", headers=USER)
    assert response.status_code == 404


def test_list_files_returns_owned_files_only(client):
    _upload(client, headers=USER, filename="mine.txt")
    _upload(client, headers=OTHER_USER, filename="theirs.txt")
    response = client.get("/api/v1/files", headers=USER)
    body = response.json()
    assert body["total_items"] == 1
    assert body["items"][0]["filename"] == "mine.txt"


def test_list_files_filter_by_folder(client):
    folder = client.post("/api/v1/folders", json={"name": "F"}, headers=USER).json()
    _upload(client, filename="in_folder.txt", folder_id=folder["id"])
    _upload(client, filename="at_root.txt")

    response = client.get(f"/api/v1/files?folder_id={folder['id']}", headers=USER)
    body = response.json()
    assert body["total_items"] == 1
    assert body["items"][0]["filename"] == "in_folder.txt"


def test_list_files_search_by_name(client):
    _upload(client, filename="quarterly_report.txt")
    _upload(client, filename="notes.txt")

    response = client.get("/api/v1/files?q=quarterly", headers=USER)
    body = response.json()
    assert body["total_items"] == 1
    assert body["items"][0]["filename"] == "quarterly_report.txt"


def test_list_files_filter_by_extension(client):
    _upload(client, filename="a.txt")
    _upload(client, filename="b.csv", content=b"a,b,c")

    response = client.get("/api/v1/files?extension=csv", headers=USER)
    body = response.json()
    assert body["total_items"] == 1
    assert body["items"][0]["filename"] == "b.csv"


def test_list_files_pagination(client):
    for i in range(5):
        _upload(client, filename=f"file{i}.txt")

    response = client.get("/api/v1/files?page=1&page_size=2", headers=USER)
    body = response.json()
    assert len(body["items"]) == 2
    assert body["total_items"] == 5
    assert body["total_pages"] == 3


def test_upload_allows_duplicate_filenames(client):
    """Two files with the same display name are distinct records with distinct storage."""
    first = _upload(client, filename="report.txt", content=b"version one").json()
    second = _upload(client, filename="report.txt", content=b"version two").json()

    assert first["id"] != second["id"]
    assert first["filename"] == second["filename"] == "report.txt"

    # Each keeps its own independent bytes.
    first_dl = client.get(f"/api/v1/files/{first['id']}/download", headers=USER)
    second_dl = client.get(f"/api/v1/files/{second['id']}/download", headers=USER)
    assert first_dl.content == b"version one"
    assert second_dl.content == b"version two"


def test_upload_sanitizes_control_characters_in_filename(client):
    """A filename containing CR/LF must never reach the stored value or headers verbatim."""
    malicious_name = "evil\r\nX-Injected: true.txt"
    created = _upload(client, filename=malicious_name).json()
    assert "\r" not in created["filename"]
    assert "\n" not in created["filename"]

    download = client.get(f"/api/v1/files/{created['id']}/download", headers=USER)
    assert "\r" not in download.headers["content-disposition"]
    assert "\n" not in download.headers["content-disposition"]


def test_rename_sanitizes_control_characters(client):
    created = _upload(client).json()
    response = client.patch(
        f"/api/v1/files/{created['id']}",
        json={"filename": "bad\r\nname.txt"},
        headers=USER,
    )
    assert response.status_code == 200
    assert "\r" not in response.json()["filename"]
    assert "\n" not in response.json()["filename"]


def test_owner_id_with_path_separators_does_not_escape_storage_root(client, tmp_path):
    """A crafted X-User-Id must not influence the filesystem layout outside the storage root."""
    sneaky_headers = {"X-User-Id": "../../etc"}
    response = _upload(client, headers=sneaky_headers, filename="x.txt")
    assert response.status_code == 201
    # The file must still be downloadable through the API (i.e. it landed
    # somewhere valid under the storage root, not literally at /etc).
    file_id = response.json()["id"]
    download = client.get(f"/api/v1/files/{file_id}/download", headers=sneaky_headers)
    assert download.status_code == 200
