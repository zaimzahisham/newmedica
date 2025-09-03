
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.order import Order
from tests.utils import create_test_product_and_category, add_item_to_cart, register_user
from sqlmodel import select
from unittest.mock import patch
import uuid

@pytest.mark.asyncio
async def test_retry_payment_for_pending_order(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that a user can successfully initiate a new payment session
    for an existing 'pending' order.
    """
    # 1. Setup: Create a user and a pending order
    register_res = await register_user(async_client, "testretry@example.com", "password123", "Basic")
    login_res = await async_client.post("/api/v1/auth/login", data={"username": "testretry@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    result = await session.execute(select(User).where(User.email == "testretry@example.com"))
    user = result.scalar_one()
    product, _ = await create_test_product_and_category(session, "Retry Product", 50.00)
    await add_item_to_cart(async_client, headers, product.id, 1)

    # Create the initial order
    create_order_res = await async_client.post("/api/v1/orders", headers=headers, json={"payment_method": "stripe"})
    assert create_order_res.status_code == 201
    order_id = create_order_res.json()["id"]

    # 2. Action: Call the new retry-payment endpoint
    # We patch the new method we will create in the OrderService
    with patch("app.services.order_service.OrderService._create_stripe_session_for_order") as mock_create_session:
        mock_create_session.return_value = {"id": "cs_test_123", "url": "https://stripe.com/session_url_for_retry"}

        retry_res = await async_client.post(f"/api/v1/orders/{order_id}/retry-payment", headers=headers)

    # 3. Assertions
    assert retry_res.status_code == 200
    response_data = retry_res.json()
    assert "payment_url" in response_data
    assert response_data["payment_url"] == "https://stripe.com/session_url_for_retry"

    # Verify that the mock was called correctly
    mock_create_session.assert_called_once()
    
    # Verify the order status is still pending
    order_in_db = await session.get(Order, uuid.UUID(order_id))
    assert order_in_db.payment_status == "pending"

@pytest.mark.asyncio
async def test_cannot_retry_payment_for_paid_order(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that the retry-payment endpoint fails if the order is already 'paid'.
    """
    # 1. Setup: Create a user and a PAID order
    register_res = await register_user(async_client, "testpaidretry@example.com", "password123", "Basic")
    login_res = await async_client.post("/api/v1/auth/login", data={"username": "testpaidretry@example.com", "password": "password123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    product, _ = await create_test_product_and_category(session, "Paid Retry Product", 25.00)
    await add_item_to_cart(async_client, headers, product.id, 1)
    
    create_order_res = await async_client.post("/api/v1/orders", headers=headers, json={"payment_method": "stripe"})
    order_id = create_order_res.json()["id"]

    # Manually update the order to 'paid'
    order = await session.get(Order, uuid.UUID(order_id))
    order.payment_status = "paid"
    session.add(order)
    await session.commit()

    # 2. Action & Assertion
    retry_res = await async_client.post(f"/api/v1/orders/{order_id}/retry-payment", headers=headers)
    assert retry_res.status_code == 400
    assert "already been paid" in retry_res.json()["detail"]

@pytest.mark.asyncio
async def test_cannot_retry_payment_for_other_user_order(async_client: AsyncClient, session: AsyncSession):
    """
    Tests that a user cannot retry payment for an order that does not belong to them.
    """
    # 1. Setup: Create User A and their order
    register_res_A = await register_user(async_client, "userA_retry@example.com", "password123", "Basic")
    login_res_A = await async_client.post("/api/v1/auth/login", data={"username": "userA_retry@example.com", "password": "password123"})
    token_A = login_res_A.json()["access_token"]
    headers_A = {"Authorization": f"Bearer {token_A}"}
    product, _ = await create_test_product_and_category(session, "User A Product", 10.00)
    await add_item_to_cart(async_client, headers_A, product.id, 1)
    create_order_res_A = await async_client.post("/api/v1/orders", headers=headers_A, json={"payment_method": "stripe"})
    order_id_A = create_order_res_A.json()["id"]

    # 2. Create User B
    register_res_B = await register_user(async_client, "userB_retry@example.com", "password123", "Basic")
    login_res_B = await async_client.post("/api/v1/auth/login", data={"username": "userB_retry@example.com", "password": "password123"})
    token_B = login_res_B.json()["access_token"]
    headers_B = {"Authorization": f"Bearer {token_B}"}

    # 3. Action & Assertion: User B tries to retry payment for User A's order
    retry_res = await async_client.post(f"/api/v1/orders/{order_id_A}/retry-payment", headers=headers_B)
    assert retry_res.status_code == 404 # Or 403, 404 is also fine as it hides the existence of the resource
