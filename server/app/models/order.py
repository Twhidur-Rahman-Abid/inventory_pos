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


class OrderStatusUpdate(BaseModel):
    status: OrderStatus

