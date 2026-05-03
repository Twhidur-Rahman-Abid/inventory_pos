from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Boolean, Numeric, Text, DateTime, func
from ..db import Base
from datetime import datetime

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku_code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str]
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))

    price: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_percentage: Mapped[float]
    is_by_one_get_one: Mapped[bool] = mapped_column(Boolean, default=False)

    details = relationship("ProductDetail", uselist=False)
    images = relationship("ProductImage")
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


class ProductDetail(Base):
    __tablename__ = "product_details"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    description: Mapped[str] = mapped_column(Text)

class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    image_url: Mapped[str]