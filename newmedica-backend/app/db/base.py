from sqlmodel import SQLModel

# Import all models here so that Alembic can see them
from app.models.user import User
from app.models.user_type import UserType

# This is the base model that Alembic will use to generate migrations
metadata = SQLModel.metadata