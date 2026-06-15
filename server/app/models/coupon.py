from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.database.schema.coupon import CouponType


class CouponCreate(BaseModel):
    code: str = Field(..., min_length=2, max_length=50)
    coupon_type: CouponType
    value: float
    min_order_amount: float = 0
    max_usage: Optional[int] = None
    is_active: bool = True
    expires_at: Optional[datetime] = None


class CouponUpdate(BaseModel):
    code: Optional[str] = None
    coupon_type: Optional[CouponType] = None
    value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_usage: Optional[int] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None


class CouponResponse(BaseModel):
    id: int
    code: str
    coupon_type: str
    value: float
    min_order_amount: float
    max_usage: Optional[int]
    used_count: int
    is_active: bool
    expires_at: Optional[datetime]
    model_config = {
        "from_attributes": True
    }


class CouponListResponse(BaseModel):
    data: list[CouponResponse]