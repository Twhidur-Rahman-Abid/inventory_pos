from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from datetime import datetime, timezone
from ..db import Base

class Branch(Base):
    __tablename__ = "branch"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str]
    img: Mapped[str]
    created_at:Mapped[datetime] = mapped_column(DateTime, default =  datetime.now(timezone.utc), nullable=False)
    updated_at:Mapped[datetime] = mapped_column(DateTime, default =  datetime.now(timezone.utc), nullable=False,onupdate=datetime.now(timezone.utc))