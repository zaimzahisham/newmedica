from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body, Query
from typing import List, Optional
from uuid import UUID
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import get_session
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.schemas.media import ProductMediaRead
from app.services.product_service import ProductService
from app.api.v1.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter()

@router.post("", response_model=ProductRead, status_code=201)
async def create_product(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = ProductService(db)
    product = await service.create_product(product_in)
    return await service.get_product_by_id(product.id)

@router.get("", response_model=List[ProductRead])
async def get_all_products(
    db: AsyncSession = Depends(get_session),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: str = Query("asc")
):
    service = ProductService(db)
    products = await service.get_all_products(
        category_name=category,
        search_term=search,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return products

@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_session)
):
    service = ProductService(db)
    product = await service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: UUID,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = ProductService(db)
    product = await service.update_product(product_id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await service.get_product_by_id(product.id)

@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = ProductService(db)
    success = await service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return

@router.post("/{product_id}/media", response_model=ProductMediaRead, status_code=201)
async def upload_product_media(
    product_id: UUID,
    media_type: str = Form(...),
    display_order: int = Form(0),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = ProductService(db)
    product = await service.get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    media = await service.add_media_to_product(product_id, file, media_type, display_order)
    return media

@router.put("/{product_id}/media/order", status_code=200)
async def update_media_order(
    product_id: UUID,
    media_ids: List[UUID] = Body(..., embed=True),
    db: AsyncSession = Depends(get_session),
    admin_user: User = Depends(get_current_admin_user)
):
    service = ProductService(db)
    await service.update_media_order(product_id, media_ids)
    return {"message": "Media order updated successfully"}
