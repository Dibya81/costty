"""Pydantic schemas for the admin dashboard."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AdminOverviewResponse(BaseModel):
    total_users: int
    active_users: int
    total_documents: int
    total_estimates: int
    total_revenue: float
    currency: str
    total_shares: int
    open_requests: int
    fulfilled_requests: int


class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserListResponse(BaseModel):
    items: list[AdminUserResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int


class AdminEstimateResponse(BaseModel):
    estimate_id: int
    page_count: int
    copies: int
    color_mode: str
    print_type: str
    total_cost: float
    currency: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminEstimateListResponse(BaseModel):
    items: list[AdminEstimateResponse]
    page: int
    page_size: int
    total_items: int
    total_pages: int


class RevenuePoint(BaseModel):
    date: str
    revenue: float


class AdminRevenueResponse(BaseModel):
    total_revenue: float
    today_revenue: float
    monthly_revenue: float
    total_estimates: int
    average_estimate: float
    currency: str
    series: list[RevenuePoint]


class AdminDocumentBreakdownResponse(BaseModel):
    total_documents: int
    by_extension: dict[str, int]


class AdminCommunityStatsResponse(BaseModel):
    total_requests: int
    open_requests: int
    fulfilled_requests: int
    total_offers: int