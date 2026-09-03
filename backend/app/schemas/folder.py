"""Pydantic request/response schemas for folders."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FolderCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_folder_id: int | None = None


class FolderUpdateRequest(BaseModel):
    """Rename and/or move a folder. Omit a field to leave it unchanged."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    parent_folder_id: int | None = Field(
        default=None,
        description="New parent folder ID, or explicit null to move to root.",
    )
    move_to_root: bool = Field(
        default=False,
        description="Set true to explicitly move this folder to the root (clears parent_folder_id).",
    )


class FolderResponse(BaseModel):
    id: int
    name: str
    owner_id: str
    parent_folder_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FolderListResponse(BaseModel):
    items: list[FolderResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int
