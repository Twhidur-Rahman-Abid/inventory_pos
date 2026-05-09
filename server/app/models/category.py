from pydantic import BaseModel
from typing import Optional

class CategoryCreate(BaseModel):
    id:int
    name: str
    img: Optional[str] = None

class CategoryResponse(BaseModel):
    count:int
    has_next:bool
    data: list[CategoryCreate]
