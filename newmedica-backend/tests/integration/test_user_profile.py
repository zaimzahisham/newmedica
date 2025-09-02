
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from tests.utils import create_test_user, get_user_token

@pytest.mark.asyncio
async def test_update_user_profile(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that a user can update their own profile information.
    """
    # 1. Create a user and get a token
    user, token = await get_user_token(async_client, session)

    # 2. Define the profile update data
    update_data = {
        "firstName": "John",
        "lastName": "Doe",
        "gender": "Male",
        "dateOfBirth": "1990-01-01",
        "hpNo": "123456789"
    }

    # 3. Make the PATCH request to update the profile
    response = await async_client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json=update_data,
    )

    # 4. Assert the response is successful
    assert response.status_code == 200
    updated_user_data = response.json()

    # 5. Assert the extra_fields were updated correctly
    assert updated_user_data["firstName"] == "John"
    assert updated_user_data["lastName"] == "Doe"

    # 6. Verify the data was persisted in the database
    await session.refresh(user)
    assert user.extra_fields["firstName"] == "John"
    assert user.extra_fields["lastName"] == "Doe"

    # 7. Verify the email (a non-updatable field) remains unchanged
    assert updated_user_data["email"] == user.email
