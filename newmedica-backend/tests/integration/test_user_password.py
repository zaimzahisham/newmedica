
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password
from app.models import User
from tests.utils import get_user_token

password = "password"

@pytest.mark.asyncio
async def test_change_password_success(async_client: AsyncClient, session: AsyncSession):
    """
    Test case for successfully changing a user's password.
    """
    user, token = await get_user_token(async_client, session)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await async_client.patch(
        "/api/v1/users/me/password",
        headers=headers,
        json={"old_password": password, "new_password": "new_password123"},
    )
    
    assert response.status_code == 200
    assert response.json()["message"] == "Password updated successfully"

    # Verify the password was actually changed in the DB
    await session.refresh(user)
    assert verify_password("new_password123", user.password_hash)
    assert not verify_password(password, user.password_hash)

@pytest.mark.asyncio
async def test_change_password_incorrect_old_password(async_client: AsyncClient, session: AsyncSession):
    """
    Test case for failing to change a user's password with an incorrect old password.
    """
    user, token = await get_user_token(async_client, session)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await async_client.patch(
        "/api/v1/users/me/password",
        headers=headers,
        json={"old_password": "wrong_old_password", "new_password": "new_password123"},
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect old password"

@pytest.mark.asyncio
async def test_change_password_same_as_old(async_client: AsyncClient, session: AsyncSession):
    """
    Test case for failing to change a user's password if the new password is the same as the old one.
    """
    user, token = await get_user_token(async_client, session)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await async_client.patch(
        "/api/v1/users/me/password",
        headers=headers,
        json={"old_password": password, "new_password": password},
    )
    
    assert response.status_code == 400
    assert response.json()["detail"] == "New password must be different from the old password"

@pytest.mark.asyncio
async def test_change_password_unauthenticated(async_client: AsyncClient):
    """
    Test case for ensuring an unauthenticated user cannot change a password.
    """
    response = await async_client.patch(
        "/api/v1/users/me/password",
        json={"old_password": "any_password", "new_password": "new_password123"},
    )
    
    assert response.status_code == 401
