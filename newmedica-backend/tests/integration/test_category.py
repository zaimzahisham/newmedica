import pytest
from httpx import AsyncClient
from sqlmodel import select
from app.models.category import Category
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

# The async_client and admin_token_headers fixtures are defined in conftest.py

@pytest.mark.asyncio
async def test_create_category(async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession):
    response = await async_client.post(
        "/api/v1/categories",
        json={"name": "Test Category", "description": "A test category"},
        headers=admin_token_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Category"
    assert "id" in data

    # Verify timestamps
    category = (await session.execute(select(Category).where(Category.name == "Test Category"))).scalar_one()
    assert category.created_at is not None
    assert isinstance(category.created_at, datetime)
    assert category.updated_at is not None
    assert isinstance(category.updated_at, datetime)
    assert datetime.utcnow() - category.created_at < timedelta(seconds=10)

@pytest.mark.asyncio
async def test_get_categories(async_client: AsyncClient, admin_token_headers: dict):
    # First, create a category to ensure the list is not empty
    await async_client.post(
        "/api/v1/categories",
        json={"name": "Category 1", "description": "First test category"},
        headers=admin_token_headers
    )
    await async_client.post(
        "/api/v1/categories",
        json={"name": "Category 2", "description": "Second test category"},
        headers=admin_token_headers
    )

    # Now, get the list of categories
    response = await async_client.get("/api/v1/categories", headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert "Category 1" in [item['name'] for item in data]
    assert "Category 2" in [item['name'] for item in data]
