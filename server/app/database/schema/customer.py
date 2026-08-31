# order.py
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, VARCHAR, ForeignKey, Boolean
from datetime import datetime, timezone
from typing import List, Optional
from ..db import Base


class CustomerAddress(Base):
    __tablename__ = "customer_addresses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    address_line: Mapped[str] = mapped_column(VARCHAR(255), nullable=False)
    city: Mapped[Optional[str]] = mapped_column(VARCHAR(100), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc), 
        nullable=False
    )

    customer = relationship("Customer", back_populates="addresses")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[Optional[str]] = mapped_column(VARCHAR(100), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(VARCHAR(180), nullable=True)
    phone: Mapped[str] = mapped_column(VARCHAR(15), nullable=False, index=True)
    password: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
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
    orders = relationship("Order", back_populates="customer")
    
    addresses: Mapped[List["CustomerAddress"]] = relationship(
        "CustomerAddress", 
        back_populates="customer", 
        cascade="all, delete-orphan"
    )