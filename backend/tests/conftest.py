from __future__ import annotations

import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.deps import get_db
from app.core.database import Base
from app.main import app
from app.models.user import User  # noqa: F401

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Таблицы, нужные для auth-тестов (JSONB в tasks несовместим с SQLite)
_AUTH_TABLES = [User.__table__]


@pytest_asyncio.fixture
async def db_session():
    """Изолированная in-memory SQLite БД на каждый тест."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(lambda c: Base.metadata.create_all(c, tables=_AUTH_TABLES))

    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(lambda c: Base.metadata.drop_all(c, tables=_AUTH_TABLES))
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    """HTTP-клиент с подменённой зависимостью get_db."""
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
