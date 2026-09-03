"""Shared pytest fixtures: an isolated SQLite database per test and a TestClient."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.deps import get_db, get_storage
from app.core.database import Base
from app.core.storage import LocalStorageBackend
from app.main import app


@pytest.fixture()
def db_session():
    """Provide a fresh, isolated in-memory SQLite database for each test."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session, tmp_path):
    """A TestClient wired to use the isolated in-memory database and a temp storage dir."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    test_storage = LocalStorageBackend(str(tmp_path / "storage"))

    def override_get_storage():
        return test_storage

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_storage] = override_get_storage
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
