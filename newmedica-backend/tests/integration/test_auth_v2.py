
import pytest
from httpx import AsyncClient
import uuid

# The async_client fixture is defined in conftest.py

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
