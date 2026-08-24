from pydantic import BaseModel, field_validator
from typing import Optional
from app.config import get_config

class CategoryCreate(BaseModel):
    id:int
    name: str
    img: Optional[str] = None
class CategoryRes(BaseModel):
    id:int
    name: str
    img: Optional[str] = None

    @field_validator("img", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{get_config().site_link}/{relative_path}"
        return value
     
    

class CategoryResponse(BaseModel):
    count:int
    has_next:bool
    data: list[CategoryRes]
