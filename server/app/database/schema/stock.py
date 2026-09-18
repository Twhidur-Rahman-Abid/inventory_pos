# product.py
from typing import List

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    ForeignKey,
    DateTime,
    UniqueConstraint,
    Enum,
    Integer,
    String,
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



# 1. Stock Transfer Header Table
class StockTransfer(Base):
    __tablename__ = "stock_transfers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)

    # Destination Branch
    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branch.id", ondelete="RESTRICT"), 
        nullable=False, 
        index=True
    )

    status: Mapped[TransferStatus] = mapped_column(
        Enum(TransferStatus, native_enum=False),
        default=TransferStatus.PENDING,
        nullable=False,
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
    branch = relationship("Branch", back_populates="stock_transfers")
    items: Mapped[List["StockTransferItem"]] = relationship(
        "StockTransferItem", 
        back_populates="transfer", 
        cascade="all, delete-orphan"
    )


# 2. Stock Transfer Items Table (Multiple Products Support)
class StockTransferItem(Base):
    __tablename__ = "stock_transfer_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)

    transfer_id: Mapped[int] = mapped_column(
        ForeignKey("stock_transfers.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT"), 
        nullable=False, 
        index=True
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    transfer = relationship("StockTransfer", back_populates="items")
    product = relationship("Product", back_populates="transfer_items")

# --- product stock invoice track -----------
# 1. Invoice Header Table
class StockInbound(Base):
    __tablename__ = "stock_inbounds"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    invoice_no: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    
    branch_id: Mapped[int] = mapped_column(
        ForeignKey("branch.id",ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    branch = relationship("Branch", back_populates="inbounds")
    items = relationship("StockInboundItem", back_populates="inbound", cascade="all, delete-orphan")


# 2. Invoice Items Table
class StockInboundItem(Base):
    __tablename__ = "stock_inbound_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    
    inbound_id: Mapped[int] = mapped_column(
        ForeignKey("stock_inbounds.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    quantity: Mapped[int] = mapped_column(nullable=False)

    # Relationships
    inbound = relationship("StockInbound", back_populates="items")
    product = relationship("Product", back_populates="inbound_items")