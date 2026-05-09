
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, DateTime
from ..db import Base
from datetime import datetime, timezone

class Stock(Base):
    __tablename__ = "stocks"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True,index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    branch_id: Mapped[int] = mapped_column(ForeignKey("branch.id"))
    qty: Mapped[int] = mapped_column(nullable=False)
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