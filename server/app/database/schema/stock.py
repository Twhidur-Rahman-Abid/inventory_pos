
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, DateTime, func
from ..db import Base
from datetime import datetime

class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    branch_id: Mapped[int] = mapped_column(ForeignKey("branch.id"))
    qty: Mapped[int]
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