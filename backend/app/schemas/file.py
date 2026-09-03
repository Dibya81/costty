"""Pydantic request/response schemas for files."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class FileUpdateRequest(BaseModel):
    """Rename and/or move a file. Omit a field to leave it unchanged."""

    filename: str | None = Field(default=None, min_length=1, max_length=255)
    folder_id: int | None = Field(
        default=None,
        description="New folder ID to move this file into, or explicit null with move_to_root=true.",
    )
    move_to_root: bool = Field(
        default=False,
        description="Set true to explicitly move this file to the root (clears folder_id).",
    )


class FileResponse(BaseModel):
    id: int
    filename: str
    extension: str
    content_type: str
    size_bytes: int
    owner_id: str
    folder_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileListResponse(BaseModel):
    items: list[FileResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int
