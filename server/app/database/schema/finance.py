from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, Numeric
from ..db import Base
from datetime import datetime, timezone

class CustomerCredit(Base):
    __tablename__ = "customer_credits"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    amount: Mapped[float] = mapped_column(Numeric(10, 2),nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class CustomerDue(Base):
    __tablename__ = "customer_dues"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    amount: Mapped[float] = mapped_column(Numeric(10, 2),nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )