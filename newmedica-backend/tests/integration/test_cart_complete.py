
import pytest
from httpx import AsyncClient
from app.models import Product

# Placeholder test to be expanded
@pytest.mark.asyncio
async def test_get_empty_cart(async_client: AsyncClient, basic_user_token_headers: dict[str, str]):
    """
    Tests that a new user has an empty cart.
    """
    response = await async_client.get("/api/v1/cart/", headers=basic_user_token_headers)
    assert response.status_code == 200
    
    cart_data = response.json()
    assert "id" in cart_data
    assert "user_id" in cart_data
    assert cart_data["items"] == []


@pytest.mark.asyncio
async def test_add_item_to_cart(
    async_client: AsyncClient, 
    basic_user_token_headers: dict[str, str], 
    product: Product
):
    """
    Tests that an item can be added to the cart.
    """
    response = await async_client.post(
        "/api/v1/cart/items",
        headers=basic_user_token_headers,
        json={"product_id": str(product.id), "quantity": 1},
    )
    assert response.status_code == 201

    response = await async_client.get("/api/v1/cart/", headers=basic_user_token_headers)
    assert response.status_code == 200
    cart_data = response.json()
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["product"]["id"] == str(product.id)
    assert cart_data["items"][0]["quantity"] == 1


@pytest.mark.asyncio
async def test_update_cart_item_quantity(
    async_client: AsyncClient,
    basic_user_token_headers: dict[str, str],
    product: Product,
):
    """
    Tests that the quantity of an item in the cart can be updated.
    """
    # First, add an item to the cart
    response = await async_client.post(
        "/api/v1/cart/items",
        headers=basic_user_token_headers,
        json={"product_id": str(product.id), "quantity": 1},
    )
    assert response.status_code == 201
    item_id = response.json()["id"]

    # Now, update the quantity
    response = await async_client.put(
        f"/api/v1/cart/items/{item_id}",
        headers=basic_user_token_headers,
        json={"quantity": 5},
    )
    assert response.status_code == 200

    # Verify the quantity was updated
    response = await async_client.get("/api/v1/cart/", headers=basic_user_token_headers)
    assert response.status_code == 200
    cart_data = response.json()
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["quantity"] == 5


@pytest.mark.asyncio
async def test_delete_cart_item(
    async_client: AsyncClient,
    basic_user_token_headers: dict[str, str],
    product: Product,
):
    """
    Tests that an item can be removed from the cart.
    """
    # First, add an item to the cart
    response = await async_client.post(
        "/api/v1/cart/items",
        headers=basic_user_token_headers,
        json={"product_id": str(product.id), "quantity": 1},
    )
    assert response.status_code == 201
    item_id = response.json()["id"]

    # Now, delete the item
    response = await async_client.delete(
        f"/api/v1/cart/items/{item_id}",
        headers=basic_user_token_headers,
    )
    assert response.status_code == 200

    # Verify the item was deleted
    response = await async_client.get("/api/v1/cart/", headers=basic_user_token_headers)
    assert response.status_code == 200
    cart_data = response.json()
    assert len(cart_data["items"]) == 0 
