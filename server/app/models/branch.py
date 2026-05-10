from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

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
 

    model_config = ConfigDict(from_attributes=True)
