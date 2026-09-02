from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional


from app.database.schema.order import PaymentMethod, OrderStatus

class OrderItemCreate(BaseModel):
    product_id: int
    qty: int


class OrderCreate(BaseModel):
    customer_id: Optional[int] = None
    branch_id: int
    extra_discount: float = 0
    delivery: float = 0
    is_online: bool = False
    note: Optional[str] = None
    cash_amount: float = Field(default=0.0, ge=0)
    other_payment_method: Optional[PaymentMethod] = None
    other_payment_amount: float = Field(default=0.0, ge=0)
    items: list[OrderItemCreate]
    customer_name : Optional[str] = None
    customer_phone : Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class ProductResponse(BaseModel):
    id: int
    sku_code: str
    name: str
  


class OrderItemResponse(BaseModel):
    id: int
    discount_type: str | None = None
    original_price: float | None = None
    qty: int
    selling_price: float
    product: ProductResponse

class Branch(BaseModel):
    id: int
    name: str


class CustomerResponse(BaseModel):
    id: int
    name: str | None = None
    phone: str


class OrderResponseBase(BaseModel):
    id: int
    total: float
    delivery: float
    extra_discount: float
    note: str
    status: str
    is_online: bool
    cash_amount:float
    other_payment_method: Optional[PaymentMethod] = None
    other_payment_amount: float | None = None
    created_at: datetime
    updated_at: datetime
    branch: Branch
    customer: Optional[CustomerResponse] = None
    items: list[OrderItemResponse]


class OrderResponse(BaseModel):
    message:str
    data: OrderResponseBase

class BasicOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    note: Optional[str] = ""
    other_payment_method: Optional[str] = None
    other_payment_amount: Decimal
    cash_amount: Decimal
    total: Decimal
    status: str | None = None

class BasicOrderPaginatedResponse(BaseModel):
    count: int
    data: List[BasicOrderResponse]