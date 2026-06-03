"""Add more order status for online order track

Revision ID: 6c88b413cce2
Revises: 59865536cc6f
Create Date: 2026-06-01 21:10:19.921333

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '6c88b413cce2'
down_revision: Union[str, Sequence[str], None] = '59865536cc6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add new enum values
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'processing'")
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'packing'")
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'out_for_delivery'")
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'delivered'")
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'completed'")
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'cancelled'")
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'refunded'")


def downgrade() -> None:
    """Downgrade schema."""

    # ⚠️ PostgreSQL enum cannot remove values safely
    # So downgrade is intentionally left empty
    pass