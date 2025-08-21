
import sys
from pathlib import Path
import asyncio

# Add project root to the path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.db.session import engine, AsyncSessionLocal
from app.db.base import metadata
from app.models.user_type import UserType

USER_TYPES = ["Basic", "Agent", "Healthcare", "Admin"]

async def seed_user_types(db: AsyncSession):
    for type_name in USER_TYPES:
        result = await db.execute(select(UserType).where(UserType.name == type_name))
        if not result.scalar_one_or_none():
            user_type = UserType(name=type_name)
            db.add(user_type)
    await db.commit()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        await seed_user_types(session)

if __name__ == "__main__":
    print("Initializing database...")
    asyncio.run(init_db())
    print("Database initialized.")
