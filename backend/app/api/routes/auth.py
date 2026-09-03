"""Authentication endpoints — register, login, and current-user."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.core.config import Settings, get_settings
from app.models.user import User
from app.schemas.auth import (
    LoginResponse,
    RegisterRequest,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    user = auth_service.register_user(db, payload)
    return auth_service.to_response(user)


@router.post("/login", response_model=LoginResponse)
def login(
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> LoginResponse:
    user = auth_service.authenticate_user(db, form.username, form.password)
    token = auth_service.create_access_token(user, settings)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=auth_service.to_response(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return auth_service.to_response(current_user)
