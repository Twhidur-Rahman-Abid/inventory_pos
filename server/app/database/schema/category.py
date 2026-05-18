# product.py
from sqlalchemy.orm import Mapped, mapped_column,relationship
from sqlalchemy import String,DateTime
from datetime import datetime,timezone
from ..db import Base

class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    name: Mapped[str] = mapped_column(String(100),nullable=False)
    img: Mapped[str] = mapped_column(nullable=True)

    products: Mapped[list["Product"]] = relationship(
        "Product", 
        back_populates="category", 
        cascade="all, delete-orphan",
        passive_deletes=True
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