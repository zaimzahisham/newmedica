import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from sqlmodel import select

from app.db.session import get_session
from app.models.category import Category
from app.models.product import Product
from app.models.product_media import ProductMedia
from app.models.user_type import UserType
from app.models.voucher import Voucher, VoucherProductLink


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

        # --- Seed Vouchers ---
        print("Upserting vouchers...")

        # fetch target product by given id or name fallback
        barrier_product = (
            await session.execute(
                select(Product).where(Product.id == uuid.UUID("9f487ce0-a98f-49f0-9445-564ae0fc0c73"))
            )
        ).scalar_one_or_none()
        if not barrier_product:
            barrier_product = (
                await session.execute(
                    select(Product).where(Product.name == "Med-Cover Barrier Cream, 120g")
                )
            ).scalar_one_or_none()

        agent_type = (
            await session.execute(select(UserType).where(UserType.name == "Agent"))
        ).scalar_one()
        healthcare_type = (
            await session.execute(select(UserType).where(UserType.name == "Healthcare"))
        ).scalar_one()

        # Healthcare voucher: RM20 off for Barrier Cream
        code_health = "HEALTHCARE_BARRIER_RM20"
        v_health = (
            await session.execute(select(Voucher).where(Voucher.code == code_health))
        ).scalar_one_or_none()
        if not v_health:
            v_health = Voucher(
                code=code_health,
                discount_type="fixed",
                amount=20.0,
                scope="product_list",
                target_user_type_id=healthcare_type.id,
                min_quantity=1,
                per_unit=False,
                is_active=True,
            )
            session.add(v_health)
            await session.commit()
            await session.refresh(v_health)
        # link to product
        if barrier_product:
            link = (
                await session.execute(
                    select(VoucherProductLink).where(
                        VoucherProductLink.voucher_id == v_health.id,
                        VoucherProductLink.product_id == barrier_product.id,
                    )
                )
            ).scalar_one_or_none()
            if not link:
                session.add(
                    VoucherProductLink(voucher_id=v_health.id, product_id=barrier_product.id)
                )

        # Agent voucher: RM40 off per Barrier Cream if qty >= 10
        code_agent = "AGENT_BARRIER_RM40_PER_10PLUS"
        v_agent = (
            await session.execute(select(Voucher).where(Voucher.code == code_agent))
        ).scalar_one_or_none()
        if not v_agent:
            v_agent = Voucher(
                code=code_agent,
                discount_type="fixed",
                amount=40.0,
                scope="product_list",
                target_user_type_id=agent_type.id,
                min_quantity=10,
                per_unit=True,
                is_active=True,
            )
            session.add(v_agent)
            await session.commit()
            await session.refresh(v_agent)
        if barrier_product:
            link2 = (
                await session.execute(
                    select(VoucherProductLink).where(
                        VoucherProductLink.voucher_id == v_agent.id,
                        VoucherProductLink.product_id == barrier_product.id,
                    )
                )
            ).scalar_one_or_none()
            if not link2:
                session.add(
                    VoucherProductLink(voucher_id=v_agent.id, product_id=barrier_product.id)
                )

        await session.commit()
        print("Vouchers upserted.")
        print("Database seeding complete.")

    except Exception as e:
        print(f"An error occurred during seeding: {e}")
        await session.rollback()
    finally:
        await session.close()


if __name__ == "__main__":
    asyncio.run(seed_data())
