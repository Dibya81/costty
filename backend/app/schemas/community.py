"""Pydantic schemas for the community document-request board."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CommunityOfferResponse(BaseModel):
    id: int
    author_name: str
    note: str
    file_name: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CommunityRequestResponse(BaseModel):
    id: int
    title: str
    description: str
    tags: list[str]
    author_name: str
    status: str
    created_at: datetime
    offers: list[CommunityOfferResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CreateCommunityRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1, max_length=4000)
    tags: list[str] = Field(default_factory=list, max_length=8)


class CreateCommunityOffer(BaseModel):
    note: str = Field(..., min_length=1, max_length=2000)
    file_name: str | None = Field(default=None, max_length=255)


class CommunityRequestListResponse(BaseModel):
    items: list[CommunityRequestResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int