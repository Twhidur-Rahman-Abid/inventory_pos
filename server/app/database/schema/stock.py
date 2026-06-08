from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    ForeignKey,
    DateTime,
    UniqueConstraint,
    Enum
)
from datetime import datetime, timezone
import enum

from ..db import Base


class Stock(Base):
    __tablename__ = "stocks"

    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "branch_id",
            name="uq_product_branch_stock"
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branch.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    qty: Mapped[int] = mapped_column(
        nullable=False,
        default=0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships

    product = relationship(
        "Product",
        back_populates="stocks"
    )

    branch = relationship(
        "Branch",
        back_populates="stocks"
    )

class TransferStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    CANCELLED = "cancelled"



class StockTransfer(Base):
    __tablename__ = "stock_transfers"

    id: Mapped[int] = mapped_column(primary_key=True)

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id")
    )

    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branch.id")
    )

    quantity: Mapped[int] = mapped_column(nullable=False)

    status: Mapped[TransferStatus] = mapped_column(
        Enum(TransferStatus, native_enum=False),
        default=TransferStatus.PENDING,
    )

    product = relationship("Product")
    branch = relationship("Branch")

   

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
