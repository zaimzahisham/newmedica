import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models.user import User
from app.models.product import Product
from app.models.category import Category

async def create_test_user(client: AsyncClient, session: AsyncSession, email: str, password: str) -> tuple[User, dict[str, str]]:
    """Registers a user and returns the user object and auth headers."""
    register_data = {"email": email, "password": password, "userType": "Basic"}
    await client.post("/api/v1/auth/register", json=register_data)
    
    login_data = {"username": email, "password": password}
    login_res = await client.post("/api/v1/auth/login", data=login_data)
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    result = await session.execute(select(User).where(User.email == email))
    user = result.scalar_one()
    return user, headers

async def create_test_product_and_category(session: AsyncSession, name: str, price: float) -> tuple[Product, Category]:
    """Creates a product and its category, returning both."""
    category = Category(name=f"Category for {name}", description="Test category")
    session.add(category)
    await session.commit()
    await session.refresh(category)

    product = Product(name=name, description=f"Test desc for {name}", price=price, stock=100, category_id=category.id)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product, category

async def add_item_to_cart(client: AsyncClient, headers: dict, product_id: uuid.UUID, quantity: int):
    """Adds a specified quantity of a product to the user's cart."""
    cart_item_data = {"product_id": str(product_id), "quantity": quantity}
    response = await client.post("/api/v1/cart/items", headers=headers, json=cart_item_data)
    assert response.status_code == 201
    return response.json()