from pydantic import BaseModel
from typing import Optional

class BranchCreate(BaseModel):
    name: str
    location: str
    img: Optional[str] = None