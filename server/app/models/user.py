
from pydantic import BaseModel, EmailStr,Field
from enum import Enum

from datetime import datetime
from typing import List, Optional
from app.database.schema.user import UserRole

# class UserRole(str, Enum):
#     ADMIN = "admin"
#     WAREHOUSE_MANAGER = "warehouse_manager"
#     SHOP_MANAGER = "shop_manager"
#     SHOP_STAFF = "shop_staff"

class User(BaseModel):
    name: str = Field(...,min_length=2, max_length=100)
    email: EmailStr
    mobile: str = Field(...,min_length=11,max_length=15)
    password: str = Field(...,min_length=6, max_length=25)
    branch_id: int
    role: UserRole

class AdminUser(BaseModel):
    name: str = Field(...,min_length=2, max_length=100)
    email: EmailStr
    mobile: str = Field(...,min_length=11,max_length=15)
    password: str = Field(...,min_length=6, max_length=25)
    branch_id: int
    role: UserRole = Field(default=UserRole.admin)
    admin_secret_key: str = Field(...)

class AdminUserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    mobile: str | None = None
    password: str | None = None
    branch_id: int | None = None
    role: UserRole | None = None
    admin_secret_key: str | None = None

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    mobile: Optional[str] = Field(None, min_length=11, max_length=15)
    branch_id: Optional[int] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool]

class BranchMinimalResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    mobile: str
    role: str
    is_active: bool
    branch: Optional[BranchMinimalResponse] = None 

    class Config:
        from_attributes = True

class UserPaginationResponse(BaseModel):
    count: int
    page: int
    has_next: bool
    data: List[UserResponse]

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