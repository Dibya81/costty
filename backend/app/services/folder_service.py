"""Business logic for folder management."""

from sqlalchemy.orm import Session

from app.models.folder import Folder
from app.repositories import folder_repository


class FolderNotFoundError(ValueError):
    pass


class InvalidFolderOperationError(ValueError):
    pass


def create_folder(db: Session, owner_id: str, name: str, parent_folder_id: int | None) -> Folder:
    if parent_folder_id is not None:
        parent = folder_repository.get_folder_by_id(db, parent_folder_id, owner_id)
        if parent is None:
            raise FolderNotFoundError(f"Parent folder {parent_folder_id} not found.")

    folder = Folder(name=name, owner_id=owner_id, parent_folder_id=parent_folder_id)
    return folder_repository.create_folder(db, folder)


def get_folder(db: Session, folder_id: int, owner_id: str) -> Folder:
    folder = folder_repository.get_folder_by_id(db, folder_id, owner_id)
    if folder is None:
        raise FolderNotFoundError(f"Folder {folder_id} not found.")
    return folder


def update_folder(
    db: Session,
    folder_id: int,
    owner_id: str,
    name: str | None,
    parent_folder_id: int | None,
    move_to_root: bool,
) -> Folder:
    folder = get_folder(db, folder_id, owner_id)

    if name is not None:
        folder.name = name

    if move_to_root:
        folder.parent_folder_id = None
    elif parent_folder_id is not None:
        if parent_folder_id == folder_id:
            raise InvalidFolderOperationError("A folder cannot be its own parent.")
        new_parent = folder_repository.get_folder_by_id(db, parent_folder_id, owner_id)
        if new_parent is None:
            raise FolderNotFoundError(f"Parent folder {parent_folder_id} not found.")
        folder.parent_folder_id = parent_folder_id

    db.commit()
    db.refresh(folder)
    return folder


def delete_folder(db: Session, folder_id: int, owner_id: str) -> None:
    folder = get_folder(db, folder_id, owner_id)
    if folder_repository.has_children(db, folder_id):
        raise InvalidFolderOperationError(
            "Folder is not empty. Move or delete its contents before deleting the folder."
        )
    folder_repository.delete_folder(db, folder)
