from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Boolean, Numeric, Text
from ..db import Base
from datetime import datetime,timezone

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    sku_code: Mapped[str] = mapped_column(String, unique=True,index=True,nullable=False)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)

    price: Mapped[float] = mapped_column(Numeric(10, 2),nullable=False)
    discount_percentage: Mapped[float] 
    is_by_one_get_one: Mapped[bool] = mapped_column(Boolean, default=False)

    details = relationship("ProductDetail", uselist=False)
    images = relationship("ProductImage")
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class ProductDetail(Base):
    __tablename__ = "product_details"

    id: Mapped[int] = mapped_column(primary_key=True,autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    description: Mapped[str] = mapped_column(Text,nullable=False)

class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    image_url: Mapped[str] = mapped_column(nullable=False)