from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints import auth, categories, media, products, users, cart, orders

app = FastAPI(title="Newmedica API")

# CORS Configuration
origins = [
    "http://localhost:3000",  # The default Next.js port
    "http://localhost:3001",  # A common alternative
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["categories"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(media.router, prefix="/api/v1/media", tags=["media"])
app.include_router(cart.router, prefix="/api/v1/cart", tags=["cart"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Newmedica API"}
