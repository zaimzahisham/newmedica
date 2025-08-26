import io
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.category import Category
from app.models.product import Product
from app.models.product_media import ProductMedia

# Fixtures are in conftest.py


@pytest.mark.asyncio
async def test_create_product(
    async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession
):
    category = Category(name="Test Category for Product", description="Desc")
    session.add(category)
    await session.commit()
    await session.refresh(category)

    response = await async_client.post(
        "/api/v1/products",
        json={
            "name": "Test Product",
            "description": "A cool test product",
            "price": 99.99,
            "stock": 100,
            "category_id": str(category.id),
        },
        headers=admin_token_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"

    # Verify timestamps
    product = await session.get(Product, uuid.UUID(data["id"]))
    assert product.created_at is not None  # type: ignore
    assert isinstance(product.created_at, datetime)  # type: ignore
    assert product.updated_at is not None  # type: ignore
    assert isinstance(product.updated_at, datetime)  # type: ignore
    assert datetime.now(timezone.utc) - product.created_at.replace(tzinfo=timezone.utc) < timedelta(seconds=10)  # type: ignore


@pytest.mark.asyncio
async def test_get_products(async_client: AsyncClient, session: AsyncSession):
    category = Category(name="Get All Test", description="Desc")
    session.add(category)
    await session.commit()
    await session.refresh(category)

    product = Product(
        name="Product 1 for Get",
        description="...",
        price=10.0,
        stock=10,
        category_id=category.id,
    )
    session.add(product)
    await session.commit()

    response = await async_client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_upload_media_for_product(
    async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession
):
    category = Category(name="Media Test Cat", description="Desc")
    session.add(category)
    await session.commit()
    await session.refresh(category)

    product = Product(
        name="Media Product",
        description="...",
        price=1.0,
        stock=1,
        category_id=category.id,
    )
    session.add(product)
    await session.commit()
    await session.refresh(product)

    files = {"file": ("test_image.jpg", io.BytesIO(b"a test image"), "image/jpeg")}
    data = {"alt_text": "A test image", "display_order": 1}
    response = await async_client.post(
        f"/api/v1/products/{product.id}/media",
        files=files,
        data=data,
        headers=admin_token_headers,
    )
    assert response.status_code == 201

    res = await async_client.get(f"/api/v1/products/{product.id}")
    product_data = res.json()
    assert len(product_data["media"]) == 1

    # Verify timestamps
    media = await session.get(ProductMedia, uuid.UUID(product_data["media"][0]["id"]))
    assert media.created_at is not None  # type: ignore
    assert isinstance(media.created_at, datetime)  # type: ignore
    assert media.updated_at is not None  # type: ignore
    assert isinstance(media.updated_at, datetime)  # type: ignore
    assert datetime.now(timezone.utc) - media.created_at.replace(tzinfo=timezone.utc) < timedelta(seconds=10)  # type: ignore


@pytest.mark.asyncio
async def test_update_media_order(
    async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession
):
    category = Category(name="Media Order Cat", description="Desc")
    product = Product(
        name="Media Order Product",
        description="...",
        price=1.0,
        stock=1,
        category_id=category.id,
    )
    media1 = ProductMedia(
        product=product, alt_text="Image 1", url="/url1", display_order=1
    )
    media2 = ProductMedia(
        product=product, alt_text="Image 2", url="/url2", display_order=2
    )
    session.add_all([category, product, media1, media2])
    await session.commit()
    await session.refresh(media1)
    await session.refresh(media2)

    new_order = [str(media2.id), str(media1.id)]
    response = await async_client.put(
        f"/api/v1/products/{product.id}/media/order",
        json={"media_ids": new_order},
        headers=admin_token_headers,
    )
    assert response.status_code == 200

    res = await async_client.get(f"/api/v1/products/{product.id}")
    product_data = res.json()
    assert product_data["media"][0]["id"] == str(media2.id)
    assert product_data["media"][1]["id"] == str(media1.id)


@pytest.mark.asyncio
async def test_delete_media(
    async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession
):
    category = Category(name="Media Delete Cat", description="Desc")
    product = Product(
        name="Media Delete Product",
        description="...",
        price=1.0,
        stock=1,
        category_id=category.id,
    )
    media = ProductMedia(
        product=product, alt_text="Image to delete", url="/todelete", display_order=1
    )
    session.add_all([category, product, media])
    await session.commit()
    await session.refresh(media)

    response = await async_client.delete(
        f"/api/v1/media/{media.id}", headers=admin_token_headers
    )
    assert response.status_code == 204

    res = await async_client.get(f"/api/v1/products/{product.id}")
    product_data = res.json()
    assert len(product_data["media"]) == 0


@pytest.mark.asyncio
async def test_get_product_by_id(async_client: AsyncClient, session: AsyncSession):
    category = Category(name="Get By ID Cat", description="Desc")
    product = Product(
        name="Get By ID Product",
        description="...",
        price=1.0,
        stock=1,
        category_id=category.id,
    )
    session.add_all([category, product])
    await session.commit()
    await session.refresh(product)

    response = await async_client.get(f"/api/v1/products/{product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Get By ID Product"
    assert data["id"] == str(product.id)


@pytest.mark.asyncio
async def test_update_product(
    async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession
):
    category = Category(name="Update Cat", description="Desc")
    product = Product(
        name="Product to Update",
        description="Old desc",
        price=10.0,
        stock=10,
        category_id=category.id,
    )
    session.add_all([category, product])
    await session.commit()
    await session.refresh(product)

    update_data = {"name": "Updated Name", "price": 15.50}
    response = await async_client.put(
        f"/api/v1/products/{product.id}", json=update_data, headers=admin_token_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["price"] == 15.50
    assert data["description"] == "Old desc"  # Description should not change


@pytest.mark.asyncio
async def test_delete_product(
    async_client: AsyncClient, admin_token_headers: dict, session: AsyncSession
):
    category = Category(name="Delete Cat", description="Desc")
    product = Product(
        name="Product to Delete",
        description="...",
        price=1.0,
        stock=1,
        category_id=category.id,
    )
    session.add_all([category, product])
    await session.commit()
    await session.refresh(product)

    response = await async_client.delete(
        f"/api/v1/products/{product.id}", headers=admin_token_headers
    )
    assert response.status_code == 204

    # Verify it's gone
    response = await async_client.get(f"/api/v1/products/{product.id}")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_products_filtered_by_category(
    async_client: AsyncClient, session: AsyncSession
):
    cat1 = Category(name="Filter Cat 1", description="Desc 1")
    cat2 = Category(name="Filter Cat 2", description="Desc 2")
    prod1 = Product(
        name="Filter Prod 1",
        description="A product for filtering",
        price=10,
        stock=1,
        category=cat1,
    )
    prod2 = Product(
        name="Filter Prod 2",
        description="Another product for filtering",
        price=20,
        stock=1,
        category=cat2,
    )
    session.add_all([cat1, cat2, prod1, prod2])
    await session.commit()

    response = await async_client.get(f"/api/v1/products?category={cat1.name}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Filter Prod 1"


@pytest.mark.asyncio
async def test_get_products_sorted_by_price(
    async_client: AsyncClient, session: AsyncSession
):
    category = Category(name="Sort Cat", description="Desc")
    prod1 = Product(
        name="Sort Prod 1",
        description="A product for sorting",
        price=20.0,
        stock=1,
        category=category,
    )
    prod2 = Product(
        name="Sort Prod 2",
        description="Another product for sorting",
        price=10.0,
        stock=1,
        category=category,
    )
    session.add_all([category, prod1, prod2])
    await session.commit()

    # Test ascending
    response_asc = await async_client.get("/api/v1/products?sort_by=price")
    assert response_asc.status_code == 200
    data_asc = response_asc.json()
    product_names_asc = [
        p["name"] for p in data_asc if p["name"] in ["Sort Prod 1", "Sort Prod 2"]
    ]
    assert product_names_asc == ["Sort Prod 2", "Sort Prod 1"]

    # Test descending
    response_desc = await async_client.get("/api/v1/products?sort_by=price-desc")
    assert response_desc.status_code == 200
    data_desc = response_desc.json()
    product_names_desc = [
        p["name"] for p in data_desc if p["name"] in ["Sort Prod 1", "Sort Prod 2"]
    ]
    assert product_names_desc == ["Sort Prod 1", "Sort Prod 2"]
