"""Data access layer for folders."""

from sqlalchemy.orm import Session

from app.models.folder import Folder


def create_folder(db: Session, folder: Folder) -> Folder:
    db.add(folder)
    db.commit()
    db.refresh(folder)
    return folder


def get_folder_by_id(db: Session, folder_id: int, owner_id: str) -> Folder | None:
    return (
        db.query(Folder)
        .filter(Folder.id == folder_id, Folder.owner_id == owner_id)
        .first()
    )


def list_folders(
    db: Session, owner_id: str, parent_folder_id: int | None, offset: int, limit: int
) -> tuple[list[Folder], int]:
    query = db.query(Folder).filter(
        Folder.owner_id == owner_id, Folder.parent_folder_id == parent_folder_id
    )
    total = query.count()
    items = query.order_by(Folder.name.asc()).offset(offset).limit(limit).all()
    return items, total


def delete_folder(db: Session, folder: Folder) -> None:
    db.delete(folder)
    db.commit()


def has_children(db: Session, folder_id: int) -> bool:
    from app.models.file import FileRecord

    has_subfolder = db.query(Folder).filter(Folder.parent_folder_id == folder_id).first()
    has_file = db.query(FileRecord).filter(FileRecord.folder_id == folder_id).first()
    return has_subfolder is not None or has_file is not None
