from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, VARCHAR
from datetime import datetime, timezone
from ..db import Base

class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    name: Mapped[str] = mapped_column(VARCHAR(100),nullable=True)
    email: Mapped[str] = mapped_column(VARCHAR(180),nullable=False)
    phone: Mapped[str] = mapped_column(VARCHAR(15),nullable=True,index=True)
    address: Mapped[str] = mapped_column(VARCHAR(255),nullable=True)
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