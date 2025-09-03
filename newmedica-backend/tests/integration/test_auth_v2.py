import uuid
from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.user import User

# The async_client fixture is defined in conftest.py


@pytest.mark.asyncio
async def test_user_registration_and_login(
    async_client: AsyncClient, session: AsyncSession
):
    unique_email = f"test_user_{uuid.uuid4()}@example.com"
    password = "SecurePassword123!"

    register_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {},
        },
    )
    assert (
        register_response.status_code == 201
    ), f"Registration failed: {register_response.text}"

    # Verify timestamps
    user = (
        await session.execute(select(User).where(User.email == unique_email))
    ).scalar_one()
    assert user.created_at is not None
    assert isinstance(user.created_at, datetime)
    assert user.updated_at is not None
    assert isinstance(user.updated_at, datetime)
    assert datetime.now(timezone.utc) - user.created_at.replace(tzinfo=timezone.utc) < timedelta(seconds=10)

    login_response = await async_client.post(
        "/api/v1/auth/login", data={"username": unique_email, "password": password}
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
        json={
            "email": email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {},
        },
    )
    assert register_response.status_code == 201

    login_response = await async_client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = await async_client.get("/api/v1/users/me", headers=headers)

    assert response.status_code == 200
    user_data = response.json()
    assert user_data["email"] == email


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient):
    email = f"test_user_{uuid.uuid4()}@example.com"
    password = "password123"

    register_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {},
        },
    )
    assert register_response.status_code == 201

    login_response = await async_client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    refresh_token = token_data["refresh_token"]

    headers = {"Authorization": f"Bearer {refresh_token}"}
    response = await async_client.post("/api/v1/auth/refresh", headers=headers)

    assert response.status_code == 200
    new_token_data = response.json()
    assert "access_token" in new_token_data
    assert "refresh_token" in new_token_data
    assert new_token_data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_existing_email_returns_conflict_error(async_client: AsyncClient):
    email = f"test_user_{uuid.uuid4()}@example.com"
    password = "SecurePassword123!"

    # Register the user first
    register_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {},
        },
    )
    assert register_response.status_code == 201

    # Attempt to register again with the same email
    duplicate_register_response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {},
        },
    )
    assert duplicate_register_response.status_code == 409
    error_data = duplicate_register_response.json()
    assert "error" in error_data
    assert error_data["error"]["code"] == "CONFLICT"
    assert error_data["error"]["message"] == "Email already registered"


@pytest.mark.asyncio
async def test_login_incorrect_credentials_returns_unauthorized_error(async_client: AsyncClient):
    email = f"test_user_{uuid.uuid4()}@example.com"
    password = "SecurePassword123!"

    # Register a user
    await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": password,
            "userType": "Basic",
            "extra_fields": {},
        },
    )

    # Attempt to login with incorrect password
    login_response = await async_client.post(
        "/api/v1/auth/login", data={"username": email, "password": "wrong_password"}
    )
    assert login_response.status_code == 401
    error_data = login_response.json()
    assert "error" in error_data
    assert error_data["error"]["code"] == "UNAUTHORIZED"
    assert error_data["error"]["message"] == "Incorrect email or password"


@pytest.mark.asyncio
async def test_register_agent_with_missing_company_name_fails(
    async_client: AsyncClient,
):
    """
    Tests that registering an Agent user fails if extra_fields is missing companyName.
    """
    unique_email = f"test_agent_{uuid.uuid4()}@example.com"
    password = "SecurePassword123!"

    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "userType": "Agent",
            "extra_fields": {"coRegNo": "12345"},  # Missing companyName
        },
    )

    assert response.status_code == 422
    error_data = response.json()
    assert "detail" in error_data
    # Check that the error message points to the specific validation failure
    assert any(
        "companyName is required for Agent users" in detail["msg"]
        for detail in error_data["detail"]
    )


@pytest.mark.asyncio
async def test_register_healthcare_with_missing_department_fails(
    async_client: AsyncClient,
):
    """
    Tests that registering a Healthcare user fails if extra_fields is missing department.
    """
    unique_email = f"test_healthcare_{uuid.uuid4()}@example.com"
    password = "SecurePassword123!"

    response = await async_client.post(
        "/api/v1/auth/register",
        json={
            "email": unique_email,
            "password": password,
            "userType": "Healthcare",
            "extra_fields": {
                "companyName": "General Hospital"
            },  # Missing department
        },
    )

    assert response.status_code == 422
    error_data = response.json()
    assert "detail" in error_data
    assert any(
        "department is required for Healthcare users" in detail["msg"]
        for detail in error_data["detail"]
    )
