"""Data access layer for files."""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.file import FileRecord


def create_file(db: Session, file_record: FileRecord) -> FileRecord:
    db.add(file_record)
    db.commit()
    db.refresh(file_record)
    return file_record


def get_file_by_id(db: Session, file_id: int, owner_id: str) -> FileRecord | None:
    return (
        db.query(FileRecord)
        .filter(FileRecord.id == file_id, FileRecord.owner_id == owner_id)
        .first()
    )


def list_files(
    db: Session,
    owner_id: str,
    offset: int,
    limit: int,
    folder_id: int | None = None,
    folder_filter_active: bool = False,
    search: str | None = None,
    extension: str | None = None,
) -> tuple[list[FileRecord], int]:
    query = db.query(FileRecord).filter(FileRecord.owner_id == owner_id)

    if folder_filter_active:
        query = query.filter(FileRecord.folder_id == folder_id)

    if search:
        like_term = f"%{search}%"
        query = query.filter(or_(FileRecord.filename.ilike(like_term)))

    if extension:
        query = query.filter(FileRecord.extension == extension.lower().lstrip("."))

    total = query.count()
    items = (
        query.order_by(FileRecord.created_at.desc(), FileRecord.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return items, total


def delete_file(db: Session, file_record: FileRecord) -> None:
    db.delete(file_record)
    db.commit()
