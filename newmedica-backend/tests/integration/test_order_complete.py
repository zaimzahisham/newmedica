import pytest
from httpx import AsyncClient
from app.models import Product, User

@pytest.mark.asyncio
async def test_create_order_from_cart(
    async_client: AsyncClient,
    basic_user_token_headers: dict[str, str],
    product: Product,
):
    """
    Tests that an order can be created from the user's cart.
    """
    # First, add an item to the cart
    response = await async_client.post(
        "/api/v1/cart/items",
        headers=basic_user_token_headers,
        json={"product_id": str(product.id), "quantity": 2},
    )
    assert response.status_code == 201

    # Now, create an order from the cart
    response = await async_client.post(
        "/api/v1/orders",
        headers=basic_user_token_headers,
    )
    assert response.status_code == 201

    order_data = response.json()
    assert "id" in order_data
    assert order_data["total_amount"] == product.price * 2
    assert len(order_data["items"]) == 1
    assert order_data["items"][0]["product"]["id"] == str(product.id)
    assert order_data["items"][0]["quantity"] == 2

    # Verify the cart is now empty
    response = await async_client.get("/api/v1/cart/", headers=basic_user_token_headers)
    assert response.status_code == 200
    cart_data = response.json()
    assert len(cart_data["items"]) == 0


@pytest.mark.asyncio
async def test_get_orders(
    async_client: AsyncClient,
    basic_user_token_headers: dict[str, str],
    product: Product,
):
    """
    Tests that a user can get a list of their orders.
    """
    # First, create an order
    response = await async_client.post(
        "/api/v1/cart/items",
        headers=basic_user_token_headers,
        json={"product_id": str(product.id), "quantity": 1},
    )
    assert response.status_code == 201
    response = await async_client.post(
        "/api/v1/orders",
        headers=basic_user_token_headers,
    )
    assert response.status_code == 201

    # Now, get the list of orders
    response = await async_client.get("/api/v1/orders", headers=basic_user_token_headers)
    assert response.status_code == 200
    orders_data = response.json()
    assert len(orders_data) == 1
    assert orders_data[0]["total_amount"] == product.price


@pytest.mark.asyncio
async def test_get_order_by_id(
    async_client: AsyncClient,
    basic_user_token_headers: dict[str, str],
    product: Product,
):
    """
    Tests that a user can get a single order by its ID.
    """
    # First, create an order
    response = await async_client.post(
        "/api/v1/cart/items",
        headers=basic_user_token_headers,
        json={"product_id": str(product.id), "quantity": 1},
    )
    assert response.status_code == 201
    response = await async_client.post(
        "/api/v1/orders",
        headers=basic_user_token_headers,
    )
    assert response.status_code == 201
    order_id = response.json()["id"]

    # Now, get the order by ID
    response = await async_client.get(
        f"/api/v1/orders/{order_id}", headers=basic_user_token_headers
    )
    assert response.status_code == 200
    order_data = response.json()
    assert order_data["id"] == order_id
    assert order_data["total_amount"] == product.price
