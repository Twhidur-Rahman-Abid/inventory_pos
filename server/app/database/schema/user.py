from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, Enum, DateTime, func
import enum
from datetime import datetime,timezone
from ..db import Base

class UserRole(enum.Enum):
    admin = "admin"
    warehouse_manager = "warehouse_manager"
    shop_manager = "shop_manager"
    shop_staff = "shop_staff"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False)

    email: Mapped[str] = mapped_column(
        String(180),
        unique=True,
        nullable=False
    )

    mobile: Mapped[str] =  mapped_column(
        String(15),
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        nullable=False
    )

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole,native_enum=False),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
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