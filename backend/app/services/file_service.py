"""Business logic for file management (upload, download, rename, move, delete, search)."""

import re
import uuid
from typing import BinaryIO

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.storage import StorageBackend, StorageError
from app.models.file import FileRecord
from app.repositories import file_repository, folder_repository

# Storage keys are namespaced by owner_id for readability/organization, but
# ownership access control is always enforced at the database layer (by
# matching FileRecord.owner_id), never by the storage path itself. This
# sanitization is defense-in-depth: it strips path separators and traversal
# sequences so a crafted X-User-Id header cannot influence the filesystem
# layout outside the storage root.
_UNSAFE_PATH_CHARS = re.compile(r"[/\\]|\.\.")


def _sanitize_path_component(value: str) -> str:
    return _UNSAFE_PATH_CHARS.sub("_", value) or "_"


class FileNotFoundError(ValueError):
    pass


class InvalidFileError(ValueError):
    pass


def _sanitize_filename(filename: str) -> str:
    cleaned = "".join(ch for ch in filename if ch not in "\r\n\t").strip()
    return cleaned[:255] if cleaned else "unnamed"


def _validate_upload(filename: str, size_bytes: int, settings: Settings) -> str:
    """Validate extension and size; returns the normalized (lowercase) extension."""
    if "." not in filename:
        raise InvalidFileError("File must have an extension.")

    extension = filename.rsplit(".", 1)[-1].lower()
    if extension not in settings.allowed_extensions_set:
        allowed = ", ".join(sorted(settings.allowed_extensions_set))
        raise InvalidFileError(
            f"File type '.{extension}' is not supported. Allowed types: {allowed}."
        )

    if size_bytes <= 0:
        raise InvalidFileError("Uploaded file is empty.")

    if size_bytes > settings.max_upload_size_bytes:
        max_mb = settings.max_upload_size_bytes / (1024 * 1024)
        raise InvalidFileError(f"File exceeds the maximum allowed size of {max_mb:.0f} MB.")

    return extension


def upload_file(
    db: Session,
    storage: StorageBackend,
    settings: Settings,
    owner_id: str,
    filename: str,
    content_type: str,
    file_obj: BinaryIO,
    folder_id: int | None,
) -> FileRecord:
    if folder_id is not None:
        folder = folder_repository.get_folder_by_id(db, folder_id, owner_id)
        if folder is None:
            raise FileNotFoundError(f"Folder {folder_id} not found.")

    # Peek size without loading the whole file into memory.
    file_obj.seek(0, 2)
    size_bytes = file_obj.tell()
    file_obj.seek(0)

    extension = _validate_upload(filename, size_bytes, settings)
    safe_filename = _sanitize_filename(filename)

    storage_key = f"{_sanitize_path_component(owner_id)}/{uuid.uuid4().hex}.{extension}"
    try:
        written_bytes = storage.save(storage_key, file_obj)
    except StorageError as exc:
        raise InvalidFileError(f"Failed to store file: {exc}") from exc

    file_record = FileRecord(
        filename=safe_filename,
        extension=extension,
        content_type=content_type or "application/octet-stream",
        size_bytes=written_bytes,
        storage_key=storage_key,
        owner_id=owner_id,
        folder_id=folder_id,
    )
    try:
        return file_repository.create_file(db, file_record)
    except Exception:
        # The blob was already written to storage; if persisting its
        # metadata fails, clean up the orphaned blob rather than leaving
        # storage and the database out of sync.
        storage.delete(storage_key)
        raise


def get_file(db: Session, file_id: int, owner_id: str) -> FileRecord:
    file_record = file_repository.get_file_by_id(db, file_id, owner_id)
    if file_record is None:
        raise FileNotFoundError(f"File {file_id} not found.")
    return file_record


def open_file_for_download(storage: StorageBackend, file_record: FileRecord) -> BinaryIO:
    try:
        return storage.open_read(file_record.storage_key)
    except StorageError as exc:
        raise FileNotFoundError(f"Stored object missing for file {file_record.id}: {exc}") from exc


def update_file(
    db: Session,
    file_id: int,
    owner_id: str,
    filename: str | None,
    folder_id: int | None,
    move_to_root: bool,
) -> FileRecord:
    file_record = get_file(db, file_id, owner_id)

    if filename is not None:
        file_record.filename = _sanitize_filename(filename)

    if move_to_root:
        file_record.folder_id = None
    elif folder_id is not None:
        folder = folder_repository.get_folder_by_id(db, folder_id, owner_id)
        if folder is None:
            raise FileNotFoundError(f"Folder {folder_id} not found.")
        file_record.folder_id = folder_id

    db.commit()
    db.refresh(file_record)
    return file_record


def delete_file(db: Session, storage: StorageBackend, file_id: int, owner_id: str) -> None:
    file_record = get_file(db, file_id, owner_id)
    storage.delete(file_record.storage_key)
    file_repository.delete_file(db, file_record)
