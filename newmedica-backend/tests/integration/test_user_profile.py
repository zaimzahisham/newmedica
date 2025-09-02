
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

@pytest.mark.asyncio
async def test_update_agent_extra_fields(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that an Agent user can update all their specific extra_fields.
    """
    # 1. Create an Agent user and get a token
    user, token = await get_user_token(async_client, session, user_type="Agent")

    # 2. Define the agent-specific profile update data
    update_data = {
        "icNo": "900101-01-1234",
        "companyName": "Agent Inc.",
        "companyAddress": "123 Agent Street, 50000 KL",
        "coRegNo": "AGENT12345",
        "coEmailAddress": "contact@agentinc.com",
        "tinNo": "TIN123456789",
        "picEinvoice": "Mr. Agent",
        "picEinvoiceEmail": "einvoice@agentinc.com",
        "picEinvoiceTelNo": "012-9876543"
    }

    # 3. Make the PATCH request
    response = await async_client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json=update_data,
    )

    # 4. Assert the response is successful
    assert response.status_code == 200
    updated_user_data = response.json()

    # 5. Assert the specific extra_fields were updated in the response
    assert updated_user_data["companyName"] == "Agent Inc."
    assert updated_user_data["coRegNo"] == "AGENT12345"
    assert updated_user_data["picEinvoiceEmail"] == "einvoice@agentinc.com"

    # 6. Verify the data was persisted correctly in the database
    await session.refresh(user)
    assert user.extra_fields["icNo"] == "900101-01-1234"
    assert user.extra_fields["companyName"] == "Agent Inc."
    assert user.extra_fields["companyAddress"] == "123 Agent Street, 50000 KL"
    assert user.extra_fields["coRegNo"] == "AGENT12345"
    assert user.extra_fields["coEmailAddress"] == "contact@agentinc.com"
    assert user.extra_fields["tinNo"] == "TIN123456789"
    assert user.extra_fields["picEinvoice"] == "Mr. Agent"
    assert user.extra_fields["picEinvoiceEmail"] == "einvoice@agentinc.com"
    assert user.extra_fields["picEinvoiceTelNo"] == "012-9876543"

@pytest.mark.asyncio
async def test_update_healthcare_extra_fields(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that a Healthcare user can update all their specific extra_fields.
    """
    # 1. Create a Healthcare user and get a token
    user, token = await get_user_token(async_client, session, user_type="Healthcare")

    # 2. Define the healthcare-specific profile update data
    update_data = {
        "icNo": "850505-05-5678",
        "hospitalName": "General Hospital",
        "department": "Cardiology",
        "position": "Senior Consultant"
    }

    # 3. Make the PATCH request
    response = await async_client.patch(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        json=update_data,
    )

    # 4. Assert the response is successful
    assert response.status_code == 200
    updated_user_data = response.json()

    # 5. Assert the specific extra_fields were updated in the response
    assert updated_user_data["hospitalName"] == "General Hospital"
    assert updated_user_data["department"] == "Cardiology"

    # 6. Verify the data was persisted correctly in the database
    await session.refresh(user)
    assert user.extra_fields["icNo"] == "850505-05-5678"
    assert user.extra_fields["hospitalName"] == "General Hospital"
    assert user.extra_fields["department"] == "Cardiology"
    assert user.extra_fields["position"] == "Senior Consultant"
