from pydantic import BaseModel, Field

class StockCreate(BaseModel):
    product_id: int
    branch_id: int
    qty: int

class SendStockSchema(BaseModel):
    product_id: int
    branch_id: int
    quantity: int = Field(gt=0)