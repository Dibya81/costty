"""
Print Cost Estimation Service — FastAPI application entrypoint.

Run with:
    uvicorn app.main:app --reload
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin, auth, community, estimates, files, folders, health, pricing, shares
from app.core.config import get_settings
from app.core.errors import register_exception_handlers

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

settings = get_settings()

if settings.cors_origins.strip() == "*":
    logger.warning(
        "CORS_ORIGINS is set to '*' with allow_credentials=True. This does not "
        "disable CORS protection — it causes the request's actual Origin to be "
        "echoed back as allowed, granting credentialed access to any site. "
        "Set CORS_ORIGINS to an explicit comma-separated list of trusted "
        "frontend origins instead."
    )

app = FastAPI(
    title="Document Platform API",
    description=(
        "REST API for the Document Platform. Currently implements two modules: "
        "(1) Print Cost Estimation — calculates and persists structured print "
        "cost breakdowns from page count, copies, color mode, and print type, "
        "with fully configurable pricing; (2) File Management — upload, "
        "download, rename, move, organize into folders, and search a personal "
        "document library. Every file/folder endpoint requires an `X-User-Id` "
        "header identifying the caller (see README for details)."
    ),
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(estimates.router)
app.include_router(pricing.router)
app.include_router(folders.router)
app.include_router(files.router)
app.include_router(shares.router)
app.include_router(community.router)
app.include_router(admin.router)


@app.get("/", tags=["Health"], summary="Root", include_in_schema=False)
def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "health": "/health",
    }
