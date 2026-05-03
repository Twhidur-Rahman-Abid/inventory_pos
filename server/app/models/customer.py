from pydantic import BaseModel,EmailStr
from typing import Optional

class CustomerCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: str
    address: str