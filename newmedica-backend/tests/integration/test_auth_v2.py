
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncio

from app.main import app
from app.db.session import get_session
from sqlmodel import SQLModel
from app.models.user_type import UserType

# Use an in-memory SQLite database for testing
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(DATABASE_URL, echo=True, future=True)
TestingSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def override_get_session() -> AsyncSession:
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_session] = override_get_session

@pytest_asyncio.fixture(scope="function")
async def async_client():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        
        # Pre-populate UserType
        async with TestingSessionLocal() as session:
            session.add(UserType(id=uuid.uuid4(), name="Basic"))
            session.add(UserType(id=uuid.uuid4(), name="Agent"))
            session.add(UserType(id=uuid.uuid4(), name="Healthcare"))
            session.add(UserType(id=uuid.uuid4(), name="Admin"))
            await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.mark.asyncio
async def test_user_registration_and_login(async_client: AsyncClient):
    unique_email = f"test_user_{uuid.uuid4()}@example.com"
    password = "SecurePassword123!"

    register_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {}
        }
    )
    assert register_response.status_code == 201, f"Registration failed: {register_response.text}"
    
    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": unique_email, "password": password}
    )
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_get_current_user(async_client: AsyncClient):
    email = f"test_user_{uuid.uuid4()}@example.com"
    password = "password123"
    
    register_response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "userType": "Basic", "extra_fields": {}}
    )
    assert register_response.status_code == 201

    login_response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get("/api/v1/users/me", headers=headers)
    
    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email
