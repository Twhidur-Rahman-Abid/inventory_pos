from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class Category(BaseModel):
    id: int
    name: str

class ProductImageBase(BaseModel):
    image_url: str
    model_config = ConfigDict(from_attributes=True)

class ProductDetailBase(BaseModel):
    description: str
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    sku_code: str
    name: str
    category_id: int
    price: float
    discount_percentage: float
    is_buy_one_get_one: bool = False
    thumbnail: Optional[str] = None
    quantity: int = 0

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