
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import pytest
from app.models import User, Voucher, UserVoucher
from tests.utils import create_test_user, create_test_voucher, create_test_user_type

@pytest.mark.asyncio
async def test_get_my_vouchers_authenticated(async_client: AsyncClient, session: AsyncSession):
    # Arrange
    # 1. Create a user type
    user_type = await create_test_user_type(session, name="VoucherTestUser")
    
    # 2. Create a user
    user = await create_test_user(session, email="voucheruser@example.com", user_type_id=user_type.id)
    
    # 3. Create a voucher
    voucher = await create_test_voucher(session, code="GETMYVOUCHER", scope="user", amount=10.0)

    # 4. Assign the voucher to the user
    user_voucher = UserVoucher(user_id=user.id, voucher_id=voucher.id)
    session.add(user_voucher)
    await session.commit()
    await session.refresh(user)

    # 5. Log in to get auth token
    login_data = {"username": user.email, "password": "password"}
    response = await async_client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Act
    response = await async_client.get("/api/v1/users/me/vouchers", headers=headers)
    
    # Assert
    assert response.status_code == 200
    response_data = response.json()
    assert isinstance(response_data, list)
    assert len(response_data) == 1
    assert response_data[0]["code"] == "GETMYVOUCHER"
    assert response_data[0]["id"] == str(voucher.id)

@pytest.mark.asyncio
async def test_get_my_vouchers_unauthenticated(async_client: AsyncClient):
    # Act
    response = await async_client.get("/api/v1/users/me/vouchers")
    
    # Assert
    assert response.status_code == 401
