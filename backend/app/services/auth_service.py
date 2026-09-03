"""Authentication service — registration, login, JWT issuance."""

import jwt
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.user import User
from app.schemas.auth import RegisterRequest, UserResponse


def hash_password(password: str) -> str:
    import bcrypt
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()


def verify_password(password: str, hashed: str) -> bool:
    import bcrypt
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(user: User, settings: Settings) -> str:
    from datetime import datetime, timedelta, timezone
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "is_admin": bool(user.is_admin),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def register_user(db: Session, payload: RegisterRequest) -> User:
    from fastapi import HTTPException, status
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    from fastapi import HTTPException, status
    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )
    return user


def to_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)
