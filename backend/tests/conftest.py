import uuid

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
)

from app.main import app
from app.database.base import Base
from app.database.session import get_db
from app.core.config import settings


# ---------------------------------------------------------
# Test Database URL
# ---------------------------------------------------------

database_url = make_url(settings.DATABASE_URL)

TEST_DATABASE_URL = database_url.set(
    database="aiaas_test"
).render_as_string(hide_password=False)


# ---------------------------------------------------------
# Database Fixture
# ---------------------------------------------------------

@pytest_asyncio.fixture(scope="function")
async def db_session():
    # Create a NEW engine for this test.
    # This prevents different tests from sharing
    # asyncpg connections while creating/dropping tables.
    test_engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )

    TestSessionLocal = async_sessionmaker(
        bind=test_engine,
        expire_on_commit=False,
    )

    try:
        # Fresh schema for this test
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Give the test its database session
        async with TestSessionLocal() as session:
            yield session

    finally:
        # Remove everything created by this test
        async with test_engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)

        # Close all connections belonging to this test
        await test_engine.dispose()


# ---------------------------------------------------------
# FastAPI Test Client
# ---------------------------------------------------------

@pytest_asyncio.fixture(scope="function")
async def client(db_session):

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------
# Test Helpers
# ---------------------------------------------------------

def unique_email() -> str:
    return f"test-{uuid.uuid4().hex[:8]}@example.com"