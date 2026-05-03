from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, Enum, DateTime, func
import enum
from datetime import datetime


class UserRole(enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    STAFF = "staff"

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    password: Mapped[str]
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
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