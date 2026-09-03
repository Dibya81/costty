"""
Storage abstraction layer.

`StorageBackend` defines the contract the rest of the application depends
on. `LocalStorageBackend` implements it against the local filesystem for
development. A future `S3StorageBackend` (or any other cloud-compatible
backend) can be dropped in behind the same interface — driven by the
`STORAGE_BACKEND` setting — without any change to services, routes, or
repositories that consume storage.
"""

import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO

from app.core.config import Settings, get_settings


class StorageError(Exception):
    """Raised when a storage operation fails."""


class StorageBackend(ABC):
    """Contract for a file storage backend."""

    @abstractmethod
    def save(self, key: str, file_obj: BinaryIO) -> int:
        """Persist `file_obj` under `key`. Returns the number of bytes written."""

    @abstractmethod
    def open_read(self, key: str) -> BinaryIO:
        """Open the object at `key` for reading. Caller is responsible for closing it."""

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete the object at `key`. Safe to call even if it does not exist."""

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Return whether an object exists at `key`."""


class LocalStorageBackend(StorageBackend):
    """Stores files on the local filesystem under a configured base directory."""

    def __init__(self, base_path: str):
        self._base_path = Path(base_path)
        self._base_path.mkdir(parents=True, exist_ok=True)

    def _resolve(self, key: str) -> Path:
        # Guard against path traversal — keys are generated server-side
        # (UUID-based), but never trust a key blindly.
        safe_key = key.replace("..", "").lstrip("/\\")
        return self._base_path / safe_key

    def save(self, key: str, file_obj: BinaryIO) -> int:
        target = self._resolve(key)
        target.parent.mkdir(parents=True, exist_ok=True)
        try:
            with open(target, "wb") as out:
                shutil.copyfileobj(file_obj, out)
            return target.stat().st_size
        except OSError as exc:
            raise StorageError(f"Failed to save file: {exc}") from exc

    def open_read(self, key: str) -> BinaryIO:
        target = self._resolve(key)
        if not target.exists():
            raise StorageError(f"Object not found: {key}")
        return open(target, "rb")

    def delete(self, key: str) -> None:
        target = self._resolve(key)
        target.unlink(missing_ok=True)

    def exists(self, key: str) -> bool:
        return self._resolve(key).exists()


class SupabaseStorageBackend(StorageBackend):
    """Stores files in Supabase Storage."""

    def __init__(self, bucket: str):
        from app.core.supabase import get_supabase_admin
        self._bucket = bucket
        self._client = get_supabase_admin()
        self._storage = self._client.storage

    def _get_bucket(self):
        return self._storage.from_bucket(self._bucket)

    def save(self, key: str, file_obj: BinaryIO) -> int:
        import tempfile
        import os
        # Read into temp file since Supabase SDK needs file path
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            import shutil
            shutil.copyfileobj(file_obj, tmp)
            tmp_path = tmp.name
        try:
            content = open(tmp_path, "rb").read()
            size = len(content)
            self._get_bucket().upload(key, content, {"content-type": "application/octet-stream"})
            return size
        finally:
            os.unlink(tmp_path)

    def open_read(self, key: str) -> BinaryIO:
        from io import BytesIO
        response = self._get_bucket().download(key)
        return BytesIO(response)

    def delete(self, key: str) -> None:
        self._get_bucket().remove(key)

    def exists(self, key: str) -> bool:
        return self._get_bucket().exists(key)


def get_storage_backend(settings: Settings | None = None) -> StorageBackend:
    """Factory returning the configured storage backend."""
    settings = settings or get_settings()
    if settings.storage_backend == "local":
        return LocalStorageBackend(settings.storage_local_path)
    if settings.storage_backend == "supabase":
        return SupabaseStorageBackend(settings.supabase_storage_bucket)
    raise NotImplementedError(
        f"Storage backend '{settings.storage_backend}' is not implemented. "
        "Add a new StorageBackend subclass and register it here."
    )
