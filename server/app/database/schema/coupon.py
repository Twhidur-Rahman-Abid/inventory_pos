from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    String,
    Boolean,
    Numeric,
    DateTime,
    Enum
)
from datetime import datetime, timezone
from ..db import Base

import enum

class CouponType(enum.Enum):
    FIXED = "fixed"
    PERCENTAGE = "percentage"

class Coupon(Base):
    __tablename__ = 'coupons'

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True,index=True)
    code: Mapped[str] = mapped_column(String(50),unique=True,nullable=False)
    coupon_type: Mapped[CouponType] = mapped_column(Enum(CouponType,native_enum=False), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(10,2),nullable=False)
    min_order_amount: Mapped[float] = mapped_column(Numeric(10,2),nullable=False, default=1)
    max_usage: Mapped[int | None] = mapped_column(
        nullable=True
    )

    used_count: Mapped[int] = mapped_column(
        default=0
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
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

