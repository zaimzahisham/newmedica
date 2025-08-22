from sqlmodel import SQLModel

# Import all models here so that Alembic can see them
from app.models.user import User
from app.models.user_type import UserType
from app.models.category import Category
from app.models.product import Product
from app.models.product_media import ProductMedia

# This is the base model that Alembic will use to generate migrations
metadata = SQLModel.metadata