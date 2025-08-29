"""convert_voucher_strings_to_enums

Revision ID: 7d0b087b8ba8
Revises: ae0af1afc004
Create Date: 2025-08-30 03:05:12.864226

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d0b087b8ba8'
down_revision: Union[str, Sequence[str], None] = 'ae0af1afc004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create ENUM types
    op.execute("CREATE TYPE discounttype AS ENUM ('FIXED', 'PERCENT')")
    op.execute("CREATE TYPE voucherscope AS ENUM ('GLOBAL', 'USER_TYPE', 'USER', 'PRODUCT_LIST')")

    # Update data
    op.execute("UPDATE voucher SET discount_type = 'FIXED' WHERE discount_type = 'fixed'")
    op.execute("UPDATE voucher SET discount_type = 'PERCENT' WHERE discount_type = 'percent'")
    op.execute("UPDATE voucher SET scope = 'GLOBAL' WHERE scope = 'global'")
    op.execute("UPDATE voucher SET scope = 'USER_TYPE' WHERE scope = 'user_type'")
    op.execute("UPDATE voucher SET scope = 'USER' WHERE scope = 'user'")
    op.execute("UPDATE voucher SET scope = 'PRODUCT_LIST' WHERE scope = 'product_list'")

    # Alter columns
    op.alter_column('voucher', 'discount_type',
               existing_type=sa.VARCHAR(),
               type_=sa.Enum('FIXED', 'PERCENT', name='discounttype'),
               existing_nullable=False, postgresql_using='discount_type::discounttype')
    op.alter_column('voucher', 'scope',
               existing_type=sa.VARCHAR(),
               type_=sa.Enum('GLOBAL', 'USER_TYPE', 'USER', 'PRODUCT_LIST', name='voucherscope'),
               existing_nullable=False, postgresql_using='scope::voucherscope')


def downgrade() -> None:
    """Downgrade schema."""
    # Alter columns back to VARCHAR
    op.alter_column('voucher', 'scope',
               existing_type=sa.Enum('GLOBAL', 'USER_TYPE', 'USER', 'PRODUCT_LIST', name='voucherscope'),
               type_=sa.VARCHAR(),
               existing_nullable=False)
    op.alter_column('voucher', 'discount_type',
               existing_type=sa.Enum('FIXED', 'PERCENT', name='discounttype'),
               type_=sa.VARCHAR(),
               existing_nullable=False)

    # Update data back to lowercase
    op.execute("UPDATE voucher SET discount_type = 'fixed' WHERE discount_type = 'FIXED'")
    op.execute("UPDATE voucher SET discount_type = 'percent' WHERE discount_type = 'PERCENT'")
    op.execute("UPDATE voucher SET scope = 'global' WHERE scope = 'GLOBAL'")
    op.execute("UPDATE voucher SET scope = 'user_type' WHERE scope = 'USER_TYPE'")
    op.execute("UPDATE voucher SET scope = 'user' WHERE scope = 'USER'")
    op.execute("UPDATE voucher SET scope = 'product_list' WHERE scope = 'PRODUCT_LIST'")

    # Drop ENUM types
    op.execute("DROP TYPE discounttype")
    op.execute("DROP TYPE voucherscope")