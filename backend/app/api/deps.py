"""Shared FastAPI dependencies (DB session, admin auth, pagination)."""

import hmac
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db  # re-exported for convenience
from app.core.storage import StorageBackend, get_storage_backend
from app.models.user import User

__all__ = [
    "get_db",
    "require_admin",
    "PaginationParams",
    "get_pagination",
    "get_current_user_id",
    "get_storage",
    "get_current_user",
    "get_current_admin",
]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def require_admin(
    x_admin_api_key: str | None = Header(default=None, alias="X-Admin-API-Key"),
    settings: Settings = Depends(get_settings),
) -> None:
    """
    Simple shared-secret admin guard for administrative operations.

    This is intentionally lightweight (per spec: avoid unnecessary auth
    complexity) — it protects pricing modification behind a header that must
    match the configured `ADMIN_API_KEY`.
    """
    if not x_admin_api_key or not hmac.compare_digest(x_admin_api_key, settings.admin_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid admin credentials.",
        )


class PaginationParams:
    def __init__(self, page: int, page_size: int):
        self.page = page
        self.page_size = page_size
        self.offset = (page - 1) * page_size


def get_pagination(
    page: int = Query(default=1, ge=1, description="Page number, starting at 1."),
    page_size: int = Query(default=None, ge=1, description="Items per page."),
    settings: Settings = Depends(get_settings),
) -> PaginationParams:
    effective_size = page_size or settings.default_page_size
    effective_size = min(effective_size, settings.max_page_size)
    return PaginationParams(page=page, page_size=effective_size)


def get_current_user_id(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
) -> str:
    """
    Legacy header-based user identification.

    NOTE: This is the old approach kept for backward compatibility with
    modules that haven't migrated to JWT auth. New endpoints should use
    get_current_user (JWT-based) instead.
    """
    if not x_user_id or not x_user_id.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing required X-User-Id header.",
        )
    return x_user_id.strip()


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    """
    JWT-based authentication dependency.

    Every protected endpoint declares `current_user: User = Depends(get_current_user)`
    to get the authenticated user. Raises 401 if the token is missing/invalid/expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )
    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled.",
        )
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )
    return current_user


def get_storage(settings: Settings = Depends(get_settings)) -> StorageBackend:
    return get_storage_backend(settings)
