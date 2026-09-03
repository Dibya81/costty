"""Health check endpoint."""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    summary="Health check",
    description="Simple liveness probe. Returns 200 OK with a status payload if the service is running.",
    response_description="Service status.",
)
def health_check() -> dict[str, str]:
    return {"status": "ok"}
