from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import DateTime,func
from datetime import datetime
from .base import Base

class Branch(Base):
    __tablename__ = "branch"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    location: Mapped[str]
    img: Mapped[str]
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