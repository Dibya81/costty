"""Admin dashboard endpoints."""

import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import PaginationParams, get_current_admin, get_db, get_pagination
from app.core.config import Settings, get_settings
from app.models.community import CommunityOffer, CommunityRequest
from app.models.estimate import PrintEstimate
from app.models.file import FileRecord
from app.models.share import ShareLink
from app.models.user import User
from app.schemas.admin import (
    AdminCommunityStatsResponse,
    AdminDocumentBreakdownResponse,
    AdminEstimateListResponse,
    AdminEstimateResponse,
    AdminOverviewResponse,
    AdminRevenueResponse,
    AdminUserListResponse,
    AdminUserResponse,
    RevenuePoint,
)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/overview", response_model=AdminOverviewResponse)
def overview(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
    settings: Settings = Depends(get_settings),
) -> AdminOverviewResponse:
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active.is_(True)).count()
    total_documents = db.query(FileRecord).count()
    total_estimates = db.query(PrintEstimate).count()
    total_revenue = db.query(func.coalesce(func.sum(PrintEstimate.total_cost), 0)).scalar()
    total_shares = db.query(ShareLink).count()
    open_requests = db.query(CommunityRequest).filter(CommunityRequest.status == "open").count()
    fulfilled_requests = (
        db.query(CommunityRequest).filter(CommunityRequest.status == "fulfilled").count()
    )
    return AdminOverviewResponse(
        total_users=total_users,
        active_users=active_users,
        total_documents=total_documents,
        total_estimates=total_estimates,
        total_revenue=float(total_revenue or 0),
        currency=settings.currency,
        total_shares=total_shares,
        open_requests=open_requests,
        fulfilled_requests=fulfilled_requests,
    )


@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
    pagination: PaginationParams = Depends(get_pagination),
) -> AdminUserListResponse:
    query = db.query(User).order_by(User.created_at.desc())
    total = query.count()
    items = query.offset(pagination.offset).limit(pagination.page_size).all()
    total_pages = math.ceil(total / pagination.page_size) if total else 0
    return AdminUserListResponse(
        items=[AdminUserResponse.model_validate(u) for u in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
    )


@router.get("/estimates", response_model=AdminEstimateListResponse)
def list_estimates(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
    pagination: PaginationParams = Depends(get_pagination),
) -> AdminEstimateListResponse:
    items, total = (
        db.query(PrintEstimate).order_by(PrintEstimate.created_at.desc()).offset(pagination.offset).limit(pagination.page_size).all(),
        db.query(PrintEstimate).count(),
    )
    total_pages = math.ceil(total / pagination.page_size) if total else 0
    out = []
    for e in items:
        out.append(
            AdminEstimateResponse(
                estimate_id=e.id,
                page_count=e.page_count,
                copies=e.copies,
                color_mode=e.color_mode,
                print_type=e.print_type,
                total_cost=float(e.total_cost or 0),
                currency=e.currency,
                created_at=e.created_at,
            )
        )
    return AdminEstimateListResponse(
        items=out,
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
        total_pages=total_pages,
    )


@router.get("/revenue", response_model=AdminRevenueResponse)
def revenue(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
    settings: Settings = Depends(get_settings),
) -> AdminRevenueResponse:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today_start.replace(day=1)

    total_revenue = float(db.query(func.coalesce(func.sum(PrintEstimate.total_cost), 0)).scalar() or 0)
    today_revenue = float(
        db.query(func.coalesce(func.sum(PrintEstimate.total_cost), 0))
        .filter(PrintEstimate.created_at >= today_start)
        .scalar()
        or 0
    )
    monthly_revenue = float(
        db.query(func.coalesce(func.sum(PrintEstimate.total_cost), 0))
        .filter(PrintEstimate.created_at >= month_start)
        .scalar()
        or 0
    )
    total_estimates = db.query(PrintEstimate).count()
    average_estimate = float(total_revenue / total_estimates) if total_estimates else 0.0

    # 14-day revenue series
    series: list[RevenuePoint] = []
    for i in range(13, -1, -1):
        day = (today_start - timedelta(days=i)).date()
        next_day = day + timedelta(days=1)
        rev = float(
            db.query(func.coalesce(func.sum(PrintEstimate.total_cost), 0))
            .filter(PrintEstimate.created_at >= day, PrintEstimate.created_at < next_day)
            .scalar()
            or 0
        )
        series.append(RevenuePoint(date=day.isoformat(), revenue=rev))

    return AdminRevenueResponse(
        total_revenue=total_revenue,
        today_revenue=today_revenue,
        monthly_revenue=monthly_revenue,
        total_estimates=total_estimates,
        average_estimate=average_estimate,
        currency=settings.currency,
        series=series,
    )


@router.get("/documents/breakdown", response_model=AdminDocumentBreakdownResponse)
def document_breakdown(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> AdminDocumentBreakdownResponse:
    rows = (
        db.query(FileRecord.extension, func.count(FileRecord.id))
        .group_by(FileRecord.extension)
        .all()
    )
    by_extension: dict[str, int] = {ext or "unknown": count for ext, count in rows}
    return AdminDocumentBreakdownResponse(
        total_documents=db.query(FileRecord).count(),
        by_extension=by_extension,
    )


@router.get("/community/stats", response_model=AdminCommunityStatsResponse)
def community_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> AdminCommunityStatsResponse:
    return AdminCommunityStatsResponse(
        total_requests=db.query(CommunityRequest).count(),
        open_requests=db.query(CommunityRequest).filter(CommunityRequest.status == "open").count(),
        fulfilled_requests=db.query(CommunityRequest).filter(CommunityRequest.status == "fulfilled").count(),
        total_offers=db.query(CommunityOffer).count(),
    )
