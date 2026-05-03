from pydantic import BaseModel
from typing import Optional

class CategoryCreate(BaseModel):
    name: str
    img: Optional[str] = None
