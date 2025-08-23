
import pytest
from httpx import AsyncClient
import uuid
from sqlmodel import select
from app.models.user import User
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

# The async_client fixture is defined in conftest.py

@pytest.mark.asyncio
async def test_user_registration_and_login(async_client: AsyncClient, session: AsyncSession):
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
    
    # Verify timestamps
    user = (await session.execute(select(User).where(User.email == unique_email))).scalar_one()
    assert user.created_at is not None
    assert isinstance(user.created_at, datetime)
    assert user.updated_at is not None
    assert isinstance(user.updated_at, datetime)
    assert datetime.utcnow() - user.created_at < timedelta(seconds=10)

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
