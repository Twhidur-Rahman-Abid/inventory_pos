from pydantic import BaseModel

class StockCreate(BaseModel):
    product_id: int
    branch_id: int
    qty: int