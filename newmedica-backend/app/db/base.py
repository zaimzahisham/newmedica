from sqlmodel import SQLModel

# Import all models here so that Alembic can see them

# This is the base model that Alembic will use to generate migrations
metadata = SQLModel.metadata
