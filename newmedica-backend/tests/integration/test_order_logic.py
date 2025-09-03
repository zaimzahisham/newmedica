import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.order import Order
from app.schemas.order import OrderCreate
from tests.utils import create_test_product_and_category, add_item_to_cart, register_user
from app.models.user import User
from sqlmodel import select
import uuid

@pytest.mark.asyncio
async def test_checkout_from_cart_always_creates_new_order(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that a checkout from the cart ALWAYS creates a new order,
    even if a previous pending order exists for the user.
    """
    # 1. Setup: Create a user, a product, and add it to the user's cart
    register_res = await register_user(async_client, "testreuse@example.com", "password123", "Basic")
    login_res = await async_client.post("/api/v1/auth/login", data={"username": "testreuse@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch the user object from the database
    result = await session.execute(select(User).where(User.email == "testreuse@example.com"))
    user = result.scalar_one()
    product1, _ = await create_test_product_and_category(session, "Product One", 99.99)
    await add_item_to_cart(async_client, headers, product1.id, 1)

    # 2. First checkout: Create Order A. This should also clear the cart.
    response1 = await async_client.post("/api/v1/orders", headers=headers, json={"payment_method": "stripe"})
    assert response1.status_code == 201
    order1_data = response1.json()
    order1_id = order1_data["id"]

    # Verify one order exists and it's pending
    orders_in_db_after_1 = await session.execute(select(Order).where(Order.user_id == user.id))
    assert len(orders_in_db_after_1.scalars().all()) == 1

    # 3. Setup for second checkout: Add a new item to the now-empty cart
    product2, _ = await create_test_product_and_category(session, "Product Two", 19.99)
    await add_item_to_cart(async_client, headers, product2.id, 2)

    # 4. Second checkout: Create Order B
    response2 = await async_client.post("/api/v1/orders", headers=headers, json={"payment_method": "stripe"})
    assert response2.status_code == 201
    order2_data = response2.json()
    order2_id = order2_data["id"]

    # 5. Assertions: Verify that a new, distinct order was created
    orders_in_db_after_2 = await session.execute(select(Order).where(Order.user_id == user.id))
    assert len(orders_in_db_after_2.scalars().all()) == 2, "A second order should have been created"
    assert order1_id != order2_id, "A new, distinct order ID should be generated"

@pytest.mark.asyncio
async def test_create_order_with_same_billing_address_as_shipping(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that when an order is created with a shipping address but no billing address,
    the billing address is automatically populated from the shipping address.
    """
    # 1. Setup
    register_res = await register_user(async_client, "testbilling@example.com", "password123", "Basic")
    login_res = await async_client.post("/api/v1/auth/login", data={"username": "testbilling@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch the user object from the database using the email
    result = await session.execute(select(User).where(User.email == "testbilling@example.com"))
    user = result.scalar_one()
    product, _ = await create_test_product_and_category(session, "Billing Test Product", 10.00)
    await add_item_to_cart(async_client, headers, product.id, 1)

    shipping_address = {
        "first_name": "Test", "last_name": "User", "address1": "123 Main St",
        "city": "Testville", "state": "Testland", "postcode": "12345",
        "country": "Testland", "phone": "555-1234"
    }

    # 2. Create order with shipping address but billing_address is explicitly null/omitted
    order_payload = OrderCreate(
        shipping_address=shipping_address,
        billing_address=None,
        payment_method="stripe"
    ).model_dump(mode="json")


    response = await async_client.post("/api/v1/orders", headers=headers, json=order_payload)
    assert response.status_code == 201
    order_data = response.json()
    order_id = order_data["id"]

    # 3. Verify the created order in the database
    created_order = await session.get(Order, uuid.UUID(order_id))
    assert created_order is not None
    assert created_order.shipping_address is not None
    assert created_order.billing_address is not None, "Billing address should not be null"
    assert created_order.billing_address == created_order.shipping_address, "Billing address should match shipping address"