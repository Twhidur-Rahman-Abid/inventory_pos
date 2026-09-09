from pydantic import BaseModel, field_validator
from typing import Optional, List


from app.config import get_config

config = get_config()

class HeroSliderResponse(BaseModel):
    id: int
    img: str
    is_active: bool
   

  
    @field_validator("img", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{config.site_link}/{relative_path}"
        return value

    class Config:
        from_attributes = True


class BestProduct(BaseModel):
    id:int
    sku_code: str
    name: str
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




class BestCategory(BaseModel):
    id:int
    name: str
    img: Optional[str] = None

    @field_validator("img", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{config.site_link}/{relative_path}"
        return value



# Single Product Item Schema
class ProductListItem(BaseModel):
    id: int
    sku_code: str
    name: str
    price: float
    thumbnail: Optional[str] = None
    discount_percentage: float = 0.0
    is_buy_one_get_one: bool = False
    quantity: int
    brand_id: Optional[int] = None
    category_id: int
    category_name: str

    class Config:
        from_attributes = True
    @field_validator("thumbnail", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{config.site_link}/{relative_path}"
        return value

# Paginated Response Schema
class ProductListResponse(BaseModel):
    data: List[ProductListItem]
    count: int = 0
    has_next: bool = False





