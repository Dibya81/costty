"""Pydantic schemas for shareable document links."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ShareLinkResponse(BaseModel):
    id: int
    slug: str
    file_id: int
    file_name: str
    permission: str
    password: bool = Field(default=False, description="Whether the link is protected by a password.")
    expires_at: datetime | None
    revoked: bool
    view_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateShareRequest(BaseModel):
    file_id: int = Field(..., description="File to share.")
    permission: str = Field(default="view", description="view | comment | edit")
    password: str | None = Field(default=None, min_length=1, max_length=255)
    expires_in_hours: int | None = Field(
        default=None,
        ge=1,
        le=24 * 365,
        description="Optional expiry, expressed in hours from creation.",
    )


class PublicShareResponse(BaseModel):
    """Subset returned when resolving a public share slug."""

    file_id: int
    file_name: str
    permission: str
    requires_password: bool
    expires_at: datetime | None