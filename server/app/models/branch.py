from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

from app.config import get_config

class BranchBase(BaseModel):
    name: str
    location: Optional[str] = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None

class BranchResponse(BranchBase):
    id: int
    img: Optional[str] = None


    @field_validator("img", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
        if value and not value.startswith("http"):
            relative_path = value.lstrip("/")
            return f"{get_config().site_link}/{relative_path}"
        return value
 

    model_config = ConfigDict(from_attributes=True)
