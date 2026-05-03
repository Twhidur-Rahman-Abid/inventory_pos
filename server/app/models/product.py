from pydantic import BaseModel
from typing import List, Optional

class ProductImageSchema(BaseModel):
    image_url: str


class ProductCreate(BaseModel):
    sku_code: str
    name: str
    category_id: int
    price: float
    discount_percentage: float
    is_by_one_get_one: Optional[bool] = False
    images: Optional[List[ProductImageSchema]]
