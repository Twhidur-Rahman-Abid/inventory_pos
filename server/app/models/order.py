from pydantic import BaseModel
from typing import List

class OrderItemCreate(BaseModel):
    product_id: int
    qty: int

class OrderCreate(BaseModel):
    customer_id: int
    branch_id: int
    items: List[OrderItemCreate]
    payment_method: str