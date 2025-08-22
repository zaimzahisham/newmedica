import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.user import User
from app.models.category import Category
from app.models.product import Product

# Mark all tests in this file as asyncio
pytestmark = pytest.mark.asyncio


async def get_auth_headers(client: AsyncClient, email: str, password: str) -> dict[str, str]:
    """Helper function to register and login a user, returning auth headers."""
    # Register
    register_data = {
        "email": email,
        "password": password,
        "user_type": "Basic",
        "extra_fields": {}
    }
    await client.post("/api/v1/auth/register", json=register_data)
    
    # Login
    login_data = {"username": email, "password": password}
    response = await client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def setup_product(db_session: AsyncSession) -> Product:
    """Fixture to create a category and a product for testing."""
    category = Category(name="Test Category", description="A category for testing")
    db_session.add(category)
    await db_session.commit()
    await db_session.refresh(category)

    product = Product(
        name="Test Product",
        description="A product for testing",
        price=99.99,
        stock=10,
        category_id=category.id,
    )
    db_session.add(product)
    await db_session.commit()
    await db_session.refresh(product)
    return product


async def test_add_item_to_cart(
    client: AsyncClient, db_session: AsyncSession, setup_product: Product
):
    """Test adding a product to the user's cart."""
    headers = await get_auth_headers(client, "cartuser@example.com", "password")
    product = setup_product

    # Add item to cart
    response = await client.post(
        "/api/v1/cart/items",
        json={"product_id": str(product.id), "quantity": 2},
        headers=headers,
    )

    assert response.status_code == 201
    cart_item = response.json()
    assert cart_item["product_id"] == str(product.id)
    assert cart_item["quantity"] == 2
    assert cart_item["product"]["name"] == "Test Product"


async def test_get_user_cart(
    client: AsyncClient, db_session: AsyncSession, setup_product: Product
):
    """Test retrieving the user's cart after adding an item."""
    headers = await get_auth_headers(client, "cartuser2@example.com", "password")
    product = setup_product

    # Add an item first
    await client.post(
        "/api/v1/cart/items",
        json={"product_id": str(product.id), "quantity": 1},
        headers=headers,
    )

    # Get the cart
    response = await client.get("/api/v1/cart", headers=headers)
    
    assert response.status_code == 200
    cart_data = response.json()
    assert len(cart_data["items"]) == 1
    assert cart_data["items"][0]["product_id"] == str(product.id)
    assert cart_data["items"][0]["quantity"] == 1
    assert cart_data["total_price"] == 99.99