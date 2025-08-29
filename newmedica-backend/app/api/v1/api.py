from fastapi import APIRouter

from app.api.v1.endpoints import (
    address,
    auth,
    cart,
    categories,
    media,
    shipping_config as shipping_cfg,
    orders,
    products,
    product_vouchers,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(product_vouchers.router, tags=["products"])
api_router.include_router(media.router, prefix="/media", tags=["media"])
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(address.router, prefix="/users/me/addresses", tags=["addresses"])
api_router.include_router(shipping_cfg.router, prefix="/admin/shipping-config", tags=["admin"]) 
