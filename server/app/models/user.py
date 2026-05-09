
from pydantic import BaseModel, EmailStr,Field
from enum import Enum

from datetime import datetime
from typing import List
from app.database.schema.user import UserRole

class UserRole(str, Enum):
    ADMIN = "admin"
    WAREHOUSE_MANAGER = "warehouse_manager"
    SHOP_MANAGER = "shop_manager"
    SHOP_STAFF = "shop_staff"

class User(BaseModel):
    name: str = Field(...,min_length=2, max_length=100)
    email: EmailStr
    mobile: str = Field(...,min_length=11,max_length=15)
    password: str = Field(...,min_length=6, max_length=100)
    role: UserRole




class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    mobile: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class UserPaginationResponse(BaseModel):
    total: int
    page: int
    limit: int
    has_next: bool
    users: List[UserResponse]





class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    mobile: str
    password: str
    role: UserRole


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class ResetPasswordSchema(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str


class RefreshTokenSchema(BaseModel):
    refresh_token: str