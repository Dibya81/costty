"""Pydantic schemas for authentication."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    """Public representation of a user — never exposes the password hash."""

    id: int
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RegisterRequest(BaseModel):
    email: str = Field(..., description="Account email (must be unique).")
    password: str = Field(..., min_length=8, max_length=255, description="Account password.")
    full_name: str = Field(..., min_length=1, max_length=255, description="Display name.")


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    """Token payload returned on a successful login."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    message: str