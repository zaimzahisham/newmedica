import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.db.session import get_session
from app.models.category import Category
from app.models.product import Product
from app.models.product_media import ProductMedia
from app.models.user_type import UserType


async def seed_data():
    """
    Seeds the database with initial data for categories and products.
    This script is idempotent and can be run multiple times.
    """
    print("Seeding database...")
    session: AsyncSession = await anext(get_session())

    try:
        # --- Upsert Categories ---
        print("Upserting categories...")

        categories_to_upsert = {
            "Hot Selling": "Our most popular products.",
            "New Arrival": "The latest additions to our catalog.",
        }

        for cat_name, cat_desc in categories_to_upsert.items():
            result = await session.execute(
                select(Category).where(Category.name == cat_name)
            )
            category = result.scalar_one_or_none()
            if not category:
                category = Category(name=cat_name, description=cat_desc)
                session.add(category)

        await session.commit()
        print("Categories upserted.")

        # --- Upsert UserTypes ---
        print("Upserting user types...")

        usertypes_to_upsert = ["Admin", "Customer", "Agent", "Healthcare"]

        for ut_name in usertypes_to_upsert:
            result = await session.execute(
                select(UserType).where(UserType.name == ut_name)
            )
            user_type = result.scalar_one_or_none()
            if not user_type:
                user_type = UserType(name=ut_name)
                session.add(user_type)

        await session.commit()
        print("User types upserted.")

        # --- Get Categories for Product Seeding ---
        hot_selling_cat = (
            await session.execute(
                select(Category).where(Category.name == "Hot Selling")
            )
        ).scalar_one()
        new_arrival_cat = (
            await session.execute(
                select(Category).where(Category.name == "New Arrival")
            )
        ).scalar_one()

        # --- Upsert Products ---
        print("Upserting products...")
        products_data = [
            {
                "name": "Oral Wipes",
                "description": "Deep cleaning teeth wipes for a fresh smile anytime.",
                "price": 39.90,
                "stock": 100,
                "category_id": hot_selling_cat.id,
                "media": [
                    {"url": "/assets/oral-wipes.jpg", "display_order": 1},
                    {"url": "/assets/oral-wipes2.jpg", "display_order": 2},
                ],
            },
            {
                "name": "IviSmile Teeth Whitening Pen",
                "description": "The best whitening pen for a busy life.",
                "price": 49.90,
                "stock": 50,
                "category_id": hot_selling_cat.id,
                "media": [
                    {"url": "/assets/ivipen.jpeg", "display_order": 1},
                    {"url": "/assets/ivipen2.jpeg", "display_order": 2},
                ],
            },
            {
                "name": "Med-Cover Barrier Cream, 120g",
                "description": (
                    "Durable and transparent barrier cream for skin protection."
                ),
                "price": 59.90,
                "stock": 75,
                "category_id": new_arrival_cat.id,
                "media": [
                    {"url": "/assets/barrier-cream.jpeg", "display_order": 1},
                    {"url": "/assets/barrier-cream-2.jpeg", "display_order": 2},
                ],
            },
            {
                "name": "Oral Wipes (Extra)",
                "description": "Another version of our popular oral wipes.",
                "price": 42.90,
                "stock": 80,
                "category_id": new_arrival_cat.id,
                "media": [
                    {"url": "/assets/oral-wipes3.jpeg", "display_order": 1},
                    {"url": "/assets/oral-wipes4.jpeg", "display_order": 2},
                ],
            },
            {
                "name": "Advanced Barrier Film",
                "description": (
                    "A breathable, transparent film for advanced skin protection."
                ),
                "price": 75.50,
                "stock": 60,
                "category_id": new_arrival_cat.id,
                "media": [
                    {"url": "/assets/barrier-cream.jpeg", "display_order": 2},
                    {"url": "/assets/barrier-cream-2.jpeg", "display_order": 1},
                ],
            },
        ]

        for p_data in products_data:
            result = await session.execute(
                select(Product).where(Product.name == p_data["name"])
            )
            product = result.scalar_one_or_none()

            if not product:
                media_items = p_data.pop("media")
                product = Product(**p_data)
                session.add(product)
                await session.commit()
                await session.refresh(product)

                for m_data in media_items:
                    media = ProductMedia(
                        product_id=product.id, alt_text=p_data["name"], **m_data
                    )
                    session.add(media)

        await session.commit()
        print("Products and media upserted.")
        print("Database seeding complete.")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        await session.rollback()
    finally:
        await session.close()


if __name__ == "__main__":
    asyncio.run(seed_data())
