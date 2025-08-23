
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, select
from typing import AsyncGenerator

from app.core.security import create_access_token
from app.db.init_db import seed_user_types
from app.db.session import get_session
from app.main import app
from app.models import (
    User,
    UserType,
)  # Use the __init__.py for imports

# Use an in-memory SQLite database for testing
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
TestingSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)  # type: ignore


# Override the get_session dependency to use the test database
async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_session] = override_get_session


@pytest_asyncio.fixture(scope="function")
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with TestingSessionLocal() as s:
        yield s


@pytest_asyncio.fixture(scope="function")
async def async_client(session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Seed user types
    await seed_user_types(session)

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def admin_user(session: AsyncSession):
    # Ensure user types are seeded before creating users
    result = await session.execute(select(UserType).where(UserType.name == "Admin"))
    admin_user_type = result.scalar_one_or_none()
    if not admin_user_type:
        admin_user_type = UserType(name="Admin")
        session.add(admin_user_type)
        await session.commit()
        await session.refresh(admin_user_type)

    user = User(
        email="admin@test.com",
        password_hash="notarealhash",  # Password doesn't matter for token creation
        user_type_id=admin_user_type.id,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def admin_token_headers(admin_user: User):
    access_token = create_access_token(subject=admin_user.id)
    headers = {"Authorization": f"Bearer {access_token}"}
    return headers
