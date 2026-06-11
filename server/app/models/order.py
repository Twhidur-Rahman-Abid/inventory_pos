from datetime import datetime

from pydantic import BaseModel
from typing import Optional


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
    payment_method: PaymentMethod = PaymentMethod.CASH
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
    qty: int
    price: float
    order_id: int
    product_id: int
    product: ProductResponse


class CustomerResponse(BaseModel):
    id: int
    name: str
    phone: str


class OrderResponse(BaseModel):
    id: int
    customer_id: Optional[int] = None
    branch_id: int

    total: float
    delivery: float
    extra_discount: float

    note: str
    status: str
    payment_method: str
    is_online: bool

    created_at: datetime
    updated_at: datetime

    customer: Optional[CustomerResponse] = None
    items: list[OrderItemResponse]


class OrderDetailsResponse(BaseModel):
    data: OrderResponse