from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Numeric, Enum, DateTime, String
from ..db import Base
import enum
from datetime import datetime, timezone

class PaymentMethod(enum.Enum):
    CASH = "cash"
    BKASH = "bkash"
    NAGAD = "nagad"
    ROCKET = "rocket"


class OrderStatus(enum.Enum):
    PENDING = 'pending'
    PROCESSING = "processing"
    PACKING = "packing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True, index=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"), nullable=True)
    branch_id: Mapped[int] = mapped_column(ForeignKey("branch.id"))

    total: Mapped[float] = mapped_column(Numeric(10, 2),nullable=False)
    extra_discount: Mapped[float] = mapped_column(Numeric(10, 2),nullable=True)
    delivery: Mapped[float] = mapped_column(Numeric(10, 2),nullable=True)
    is_online: Mapped[bool] = mapped_column(default=False)
    note: Mapped[str] = mapped_column(String(255),nullable=True)
    status: Mapped[OrderStatus] = mapped_column(
    Enum(OrderStatus),
    default=OrderStatus.COMPLETED
    )
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod),default=PaymentMethod.CASH)
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

    customer = relationship(
        "Customer",
        back_populates="orders",
    )

    branch = relationship(
        "Branch",
        back_populates="orders",
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True, index=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=False,
        index=True
    )

    qty: Mapped[int] = mapped_column(nullable=False)
    price: Mapped[float] = mapped_column(Numeric(10, 2),nullable=False)

    order = relationship(
        "Order",
        back_populates="items",
    )

    product = relationship(
        "Product",
    )