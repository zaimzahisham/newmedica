import uuid
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User, UserVoucher, Voucher
from app.repositories import UserRepository, VoucherRepository
from tests.utils import (create_test_user_type, create_test_voucher, 
                         get_test_user_type_by_name, register_user)


@pytest.mark.asyncio
async def test_auto_assign_voucher_on_registration(
    async_client: AsyncClient, session: AsyncSession
):
    # 1. Setup: Create UserTypes and a default Voucher for Healthcare
    await create_test_user_type(session, "Healthcare")
    healthcare_user_type = await get_test_user_type_by_name(session, "Healthcare")
    await create_test_voucher(
        session,
        code="WELCOME_HC",
        scope="user_type",
        target_user_type_id=healthcare_user_type.id,
    )

    # 2. Action: Register a new Healthcare user
    user_email = "newhealthcare@example.com"
    user_password = "password123"
    response = await register_user(
        async_client, user_email, user_password, healthcare_user_type.name
    )

    assert response.status_code == 201
    user_id = uuid.UUID(response.json()["id"])

    # 3. Assert: Check if the voucher was assigned
    user_repo = UserRepository(session)
    voucher_repo = VoucherRepository(session)

    user = await user_repo.get_by_id(user_id)
    assert user is not None

    # Check the UserVoucher link table directly
    voucher = await voucher_repo.get_by_code("WELCOME_HC")
    assert voucher is not None
    user_voucher = await session.get(UserVoucher, (user.id, voucher.id))
    assert user_voucher is not None
    assert not user_voucher.is_used

    # Check via relationships
    assigned_vouchers = await voucher_repo.get_vouchers_for_user(user.id)
    assert len(assigned_vouchers) == 1
    assert assigned_vouchers[0].code == "WELCOME_HC"