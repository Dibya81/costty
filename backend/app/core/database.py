"""
Database engine and session management.

Works with SQLite for local development and is PostgreSQL-ready: only the
`DATABASE_URL` environment variable needs to change to switch backends.
"""

from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# SQLite requires this connect arg when used with multiple threads (as
# FastAPI's TestClient / Uvicorn workers do). PostgreSQL does not need it.
connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)

if settings.is_sqlite:
    # SQLite does not enforce foreign key constraints unless explicitly
    # turned on per connection. Without this, FK behavior (e.g. ON DELETE
    # SET NULL on files.folder_id) would silently differ between local
    # SQLite development and production PostgreSQL, where FKs are always
    # enforced.
    @event.listens_for(engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


def get_db() -> Generator:
    """FastAPI dependency that yields a database session and ensures closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
