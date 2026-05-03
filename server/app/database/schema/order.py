from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, Numeric, Boolean,Enum, DateTime, func
from ..db import Base
import enum
from datetime import datetime

class PaymentMethod(enum.Enum):
    CASH = "cash"
    BKASH = "bkash"
    NAGAD = "nagad"
    ROCKET = "rocket"

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    branch_id: Mapped[int] = mapped_column(ForeignKey("branch.id"))

    total: Mapped[float] = mapped_column(Numeric(10, 2))
    extra_discount: Mapped[float]
    is_online: Mapped[bool] = mapped_column(default=False)
    payment_method: Mapped[str] = mapped_column(Enum(PaymentMethod),default=PaymentMethod.CASH)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))

    qty: Mapped[int]
    price: Mapped[float] = mapped_column(Numeric(10, 2))