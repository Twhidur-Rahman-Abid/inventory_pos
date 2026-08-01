# Product.py
from datetime import datetime, timezone
from typing import List, Optional

from ..db import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import VARCHAR, DateTime
class Brands(Base):
    __tablename__ = "brands"

    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    name:Mapped[str] = mapped_column(VARCHAR(100), nullable=False)
    img:Mapped[Optional[str]] = mapped_column(VARCHAR(150), nullable=True)

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

    products:Mapped[Optional[List['Product']]] = relationship("Product", back_populates="brand")