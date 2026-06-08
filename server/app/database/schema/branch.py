# user.py
# order.py
# stock.py
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import  DateTime,VARCHAR
from datetime import datetime, timezone
from ..db import Base

class Branch(Base):
    __tablename__ = "branch"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True,index=True)
    name: Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    location: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    img: Mapped[str] = mapped_column(VARCHAR(150), nullable=True)
    users: Mapped[list["User"]] = relationship(back_populates="branch")
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
    orders = relationship(
    "Order",
    back_populates="branch"
    )

    stocks = relationship(
    "Stock",
    back_populates="branch",
    cascade="all, delete-orphan"
    )