
from typing import Optional


from pydantic import BaseModel, field_validator, ConfigDict

from app.config import get_config

config = get_config()

class TopSelling(BaseModel):
    name: str
    price: int
    thumbnail: Optional[str] = None
    total_sold: int

    @field_validator("thumbnail", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
            if value and not value.startswith("http"):
                relative_path = value.lstrip("/")
                return f"{config.site_link}/{relative_path}"
            return value
    
    model_config = ConfigDict(from_attributes=True)