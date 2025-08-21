
import sys
from pathlib import Path

# Add project root to the path
sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from alembic import context
from sqlalchemy import create_engine
from app.db.base import metadata

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Get the database URL from alembic.ini
db_url = config.get_main_option('sqlalchemy.url')

# Set the target metadata for autogenerate
target_metadata = metadata

def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(url=db_url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_engine(db_url)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
