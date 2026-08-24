from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime
from app.config import get_config

class Category(BaseModel):
    id: int
    name: str

class ProductImageBase(BaseModel):
    id: int
    image_url: str
    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_url", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{get_config().site_link}/{relative_path}"
        return value
     
    

class ProductDetailBase(BaseModel):
    description: str
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    sku_code: str
    name: str
    category_id: int
    price: float
    discount_percentage: Optional[float]
    is_buy_one_get_one: bool = False
    thumbnail: Optional[str] = None
    quantity: int = 0

    @field_validator("thumbnail", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{get_config().site_link}/{relative_path}"
        return value
     
    

class ProductResponse(ProductBase):
    id: int
    details: Optional[ProductDetailBase] = None
    images: List[ProductImageBase] = []
    category: Optional[Category] = None
    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    data: List[ProductResponse]
    count: int
    has_next: bool


class StockUpdate(BaseModel):
    quantity: int