
from pydantic import BaseModel, EmailStr,Field

from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    role: str
