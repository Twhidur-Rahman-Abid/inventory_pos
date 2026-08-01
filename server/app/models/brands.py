from pydantic import BaseModel, field_validator
from typing import Optional, List


from app.config import get_config

config = get_config()

class BrandResponse(BaseModel):
    id: int
    name: str
    img: Optional[str] = None
   

  
    @field_validator("img", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{config.site_link}/{relative_path}"
        return value

    class Config:
        from_attributes = True


class BrandsResponses(BaseModel):
    data: List[BrandResponse]
    count:int





