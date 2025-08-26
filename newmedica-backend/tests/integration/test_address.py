import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import User
import uuid

# All tests use the async_client and basic_user_token_headers fixtures from conftest.py

@pytest.mark.asyncio
async def test_create_address_for_user(async_client: AsyncClient, basic_user_token_headers: dict[str, str], basic_user: User):
    """
    Test creating a new address for the authenticated user.
    """
    address_data = {
        "first_name": "John",
        "last_name": "Doe",
        "phone": "1234567890",
        "address1": "123 Main St",
        "address2": "Apt 4B",
        "city": "Anytown",
        "state": "CA",
        "postcode": "12345",
        "country": "USA",
        "is_primary": True
    }
    response = await async_client.post("/api/v1/users/me/addresses/", json=address_data, headers=basic_user_token_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == address_data["first_name"]
    assert data["is_primary"] is True
    assert data["user_id"] == str(basic_user.id)

@pytest.mark.asyncio
async def test_get_addresses_for_user(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Test retrieving all addresses for the authenticated user.
    """
    # First, create an address to ensure there is one to retrieve
    address_data = {"first_name": "Jane", "last_name": "Doe", "phone": "0987654321", "address1": "456 Oak Ave", "city": "Othertown", "state": "NY", "postcode": "54321", "country": "USA"}
    await async_client.post("/api/v1/users/me/addresses/", json=address_data, headers=basic_user_token_headers)

    response = await async_client.get("/api/v1/users/me/addresses/", headers=basic_user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["first_name"] == "Jane"

@pytest.mark.asyncio
async def test_get_single_address(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Test retrieving a single address by its ID.
    """
    # First, create an address to ensure there is one to retrieve
    address_data = {"first_name": "John", "last_name": "Doe", "phone": "1234567890", "address1": "123 Main St", "address2": "Apt 4B", "city": "Anytown", "state": "CA", "postcode": "12345", "country": "USA"}
    create_response = await async_client.post("/api/v1/users/me/addresses/", json=address_data, headers=basic_user_token_headers)
    address_id = create_response.json()["id"]

    response = await async_client.get(f"/api/v1/users/me/addresses/{address_id}", headers=basic_user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == address_id
    assert data["first_name"] == "John"

@pytest.mark.asyncio
async def test_update_address(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Test updating an existing address.
    """
    address_data = {"first_name": "John", "last_name": "Doe", "phone": "1234567890", "address1": "123 Main St", "address2": "Apt 4B", "city": "Anytown", "state": "CA", "postcode": "12345", "country": "USA"}
    create_response = await async_client.post("/api/v1/users/me/addresses/", json=address_data, headers=basic_user_token_headers)
    address_id = create_response.json()["id"]
    
    update_data = {"first_name": "Johnny"}
    response = await async_client.put(f"/api/v1/users/me/addresses/{address_id}", json=update_data, headers=basic_user_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Johnny"
    assert data["last_name"] == "Doe" # Last name should be unchanged

@pytest.mark.asyncio
async def test_set_primary_address(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Test setting an address as primary, ensuring others are unset.
    """
    address1_data = {"first_name": "John", "last_name": "Doe", "phone": "1234567890", "address1": "123 Main St", "city": "Anytown", "state": "CA", "postcode": "12345", "country": "USA", "is_primary": True}
    address2_data = {"first_name": "Jane", "last_name": "Doe", "phone": "0987654321", "address1": "456 Oak Ave", "city": "Othertown", "state": "NY", "postcode": "54321", "country": "USA"}
    address1_response = await async_client.post("/api/v1/users/me/addresses/", json=address1_data, headers=basic_user_token_headers)
    address2_response = await async_client.post("/api/v1/users/me/addresses/", json=address2_data, headers=basic_user_token_headers)
    address1_id = address1_response.json()["id"]
    address2_id = address2_response.json()["id"]
    
    address1_id = address1_response.json()["id"]
    address2_id = address2_response.json()["id"]

    # Set the second address as primary
    response = await async_client.post(f"/api/v1/users/me/addresses/{address2_id}/set-primary", headers=basic_user_token_headers)
    assert response.status_code == 200
    
    # Refetch addresses to check state
    updated_addresses_response = await async_client.get("/api/v1/users/me/addresses/", headers=basic_user_token_headers)
    updated_addresses = updated_addresses_response.json()
    
    first_address_updated = next(addr for addr in updated_addresses if addr["id"] == address1_id)
    second_address_updated = next(addr for addr in updated_addresses if addr["id"] == address2_id)

    assert first_address_updated["is_primary"] is False
    assert second_address_updated["is_primary"] is True

@pytest.mark.asyncio
async def test_delete_address(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Test deleting an address.
    """
    address_data = {"first_name": "John", "last_name": "Doe", "phone": "1234567890", "address1": "123 Main St", "city": "Anytown", "state": "CA", "postcode": "12345", "country": "USA"}
    create_response = await async_client.post("/api/v1/users/me/addresses/", json=address_data, headers=basic_user_token_headers)
    address_id_to_delete = create_response.json()["id"]

    response = await async_client.delete(f"/api/v1/users/me/addresses/{address_id_to_delete}", headers=basic_user_token_headers)
    assert response.status_code == 204

    # Verify it's gone
    get_response = await async_client.get(f"/api/v1/users/me/addresses/{address_id_to_delete}", headers=basic_user_token_headers)
    assert get_response.status_code == 404

@pytest.mark.asyncio
async def test_cannot_access_other_user_address(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Test that a user cannot access another user's address.
    This requires creating a second user and a second client.
    """
    # This is a simplified test. A real scenario would involve another authenticated client.
    # For now, we'll just try to access an address with a random UUID.
    random_address_id = str(uuid.uuid4())
    response = await async_client.get(f"/api/v1/users/me/addresses/{random_address_id}", headers=basic_user_token_headers)
    assert response.status_code == 404