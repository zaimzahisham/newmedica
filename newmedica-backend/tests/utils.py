import uuid
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.models import User, Product, Category, UserType, Voucher
from typing import Optional

async def create_test_user(session: AsyncSession, email: str, user_type_id: uuid.UUID) -> User:
    """Creates a user directly in the database for testing purposes."""
    # This is a simplified user creation for tests, bypassing registration flow
    # In real tests, you might want to use the actual registration endpoint
    user = User(email=email, password_hash="hashed_password", user_type_id=user_type_id)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    # For integration tests, we'll need to simulate login to get a token
    # This part will be handled in the test itself or a separate login helper if needed
    return user

async def create_test_product(session: AsyncSession, name: str, price: float, category_id: Optional[uuid.UUID] = None) -> Product:
    """Creates a product directly in the database."""
    if category_id is None:
        # Create a default category if none is provided
        category = Category(name=f"Default Category for {name}", description="Default test category")
        session.add(category)
        await session.commit()
        await session.refresh(category)
        category_id = category.id

    product = Product(name=name, description=f"Test desc for {name}", price=price, stock=100, category_id=category_id)
    session.add(product)
    await session.commit()
    await session.refresh(product)
    return product

async def create_test_user_type(session: AsyncSession, name: str) -> UserType:
    result = await session.execute(select(UserType).where(UserType.name == name))
    user_type = result.scalar_one_or_none()
    if user_type:
        return user_type
    user_type = UserType(name=name)
    session.add(user_type)
    await session.commit()
    await session.refresh(user_type)
    return user_type

async def create_test_voucher(
    session: AsyncSession, 
    code: str, 
    scope: str, 
    amount: float,
    discount_type: str = "fixed", 
    target_user_type_id: Optional[uuid.UUID] = None, 
    target_user_id: Optional[uuid.UUID] = None,
    min_quantity: int = 0, 
    per_unit: bool = False,
    is_active: bool = True
) -> Voucher:
    voucher = Voucher(
        code=code, 
        scope=scope, 
        discount_type=discount_type, 
        amount=amount,
        target_user_type_id=target_user_type_id,
        target_user_id=target_user_id,
        min_quantity=min_quantity,
        per_unit=per_unit,
        is_active=is_active
    )
    session.add(voucher)
    await session.commit()
    await session.refresh(voucher)
    return voucher

# Keeping these for now, though they might not be directly used by the new voucher test
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

async def get_test_user_type_by_name(session: AsyncSession, name: str) -> UserType:
    result = await session.execute(select(UserType).where(UserType.name == name))
    return result.scalar_one()

async def register_user(client: AsyncClient, email: str, password: str, user_type_name: str):
    register_data = {"email": email, "password": password, "userType": user_type_name}
    return await client.post("/api/v1/auth/register", json=register_data)
