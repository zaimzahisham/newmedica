
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.config import settings
from app.models import User
from tests.utils import create_test_user, get_test_user_type_by_name

# Mark all tests in this module as asyncio
pytestmark = pytest.mark.asyncio


async def test_non_admin_user_cannot_access_admin_route(
    async_client: AsyncClient, session: AsyncSession
) -> None:
    """
    Tests that a non-admin user receives a 403 Forbidden error when trying
    to access a protected admin route.
    """
    # Get the 'Basic' user type
    basic_user_type = await get_test_user_type_by_name(session, "Basic")
    
    # Define user credentials
    user_email = f"testuser_{uuid.uuid4()}@example.com"
    user_password = "password123"

    # Create a regular user
    user = await create_test_user(session, email=user_email, user_type_id=basic_user_type.id, password=user_password)
    
    # Log in to get the auth token
    login_data = {"username": user.email, "password": user_password}
    response = await async_client.post(f"{settings.API_V1_STR}/auth/login", data=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to access a dummy admin endpoint
    response = await async_client.get(f"{settings.API_V1_STR}/admin/test-security", headers=headers)

    # Assert that the access is forbidden
    assert response.status_code == 403
    assert response.json() == {"detail": "User does not have admin privileges"}


async def test_admin_can_get_shipping_config(async_client: AsyncClient, admin_token_headers: dict) -> None:
    response = await async_client.get(f"{settings.API_V1_STR}/admin/shipping-config", headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert "base_fee_first_item" in data
    assert "additional_fee_per_item" in data


async def test_admin_can_update_shipping_config(async_client: AsyncClient, admin_token_headers: dict) -> None:
    payload = {"base_fee_first_item": 15.50, "additional_fee_per_item": 3.25, "is_active": True}
    response = await async_client.put(f"{settings.API_V1_STR}/admin/shipping-config", headers=admin_token_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["base_fee_first_item"] == 15.50
    assert data["additional_fee_per_item"] == 3.25


async def test_non_admin_cannot_get_shipping_config(async_client: AsyncClient, basic_user_token_headers: dict) -> None:
    response = await async_client.get(f"{settings.API_V1_STR}/admin/shipping-config", headers=basic_user_token_headers)
    assert response.status_code == 403


async def test_non_admin_cannot_update_shipping_config(async_client: AsyncClient, basic_user_token_headers: dict) -> None:
    payload = {"base_fee_first_item": 15.50, "additional_fee_per_item": 3.25, "is_active": True}
    response = await async_client.put(f"{settings.API_V1_STR}/admin/shipping-config", headers=basic_user_token_headers, json=payload)
    assert response.status_code == 403

# --- Voucher Management Tests ---

async def test_admin_can_create_voucher(async_client: AsyncClient, admin_token_headers: dict) -> None:
    payload = {"code": "TESTVOUCHER1", "scope": "global", "discount_type": "fixed", "amount": 10.0, "is_active": True}
    response = await async_client.post(f"{settings.API_V1_STR}/admin/vouchers", headers=admin_token_headers, json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["code"] == "TESTVOUCHER1"
    assert data["amount"] == 10.0

async def test_admin_can_get_vouchers(async_client: AsyncClient, admin_token_headers: dict) -> None:
    response = await async_client.get(f"{settings.API_V1_STR}/admin/vouchers", headers=admin_token_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

async def test_admin_can_update_voucher(async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession) -> None:
    # First, create a voucher to update
    from app.models import Voucher
    voucher = Voucher(code="UPDATEVOUCHER", scope="global", discount_type="fixed", amount=5.0)
    session.add(voucher)
    await session.commit()

    payload = {"amount": 7.50}
    response = await async_client.put(f"{settings.API_V1_STR}/admin/vouchers/{voucher.id}", headers=admin_token_headers, json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 7.50

async def test_admin_can_delete_voucher(async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession) -> None:
    # First, create a voucher to delete
    from app.models import Voucher
    voucher = Voucher(code="DELETEVOUCHER", scope="global", discount_type="fixed", amount=5.0)
    session.add(voucher)
    await session.commit()

    response = await async_client.delete(f"{settings.API_V1_STR}/admin/vouchers/{voucher.id}", headers=admin_token_headers)
    assert response.status_code == 204

async def test_non_admin_cannot_create_voucher(async_client: AsyncClient, basic_user_token_headers: dict) -> None:
    payload = {"code": "NOACCESS", "scope": "global", "discount_type": "fixed", "amount": 10.0}
    response = await async_client.post(f"{settings.API_V1_STR}/admin/vouchers", headers=basic_user_token_headers, json=payload)
    assert response.status_code == 403

