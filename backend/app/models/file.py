"""ORM model for an uploaded file in a user's document library."""

from datetime import datetime, timezone

from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class FileRecord(Base):
    """
    Metadata for an uploaded file.

    The actual bytes live in the configured storage backend (see
    `app.core.storage`) under `storage_key`; this row tracks everything a
    frontend needs to display, search, and manage the file without touching
    storage directly.
    """

    __tablename__ = "files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Display name — independently editable via rename, decoupled from the
    # underlying storage key so renaming never touches stored bytes.
    filename: Mapped[str] = mapped_column(String(255), nullable=False)

    extension: Mapped[str] = mapped_column(String(16), nullable=False)
    content_type: Mapped[str] = mapped_column(String(128), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)

    # Opaque key used to locate the object in the storage backend.
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)

    owner_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    folder_id: Mapped[int | None] = mapped_column(
        ForeignKey("folders.id", ondelete="SET NULL"), nullable=True, index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
