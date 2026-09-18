from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.config import get_config
from app.database.schema.stock import TransferStatus


class SendStockItemSchema(BaseModel):
    product_id: int
    quantity: int

class SendStockSchema(BaseModel):
    branch_id: int
    items: List[SendStockItemSchema]


class StockCreate(BaseModel):
    product_id: int
    branch_id: int
    qty: int



 
    

class Product(BaseModel):
    thumbnail: str
    id: int
    name: str

    @field_validator("thumbnail", mode="before")
    @classmethod
    def format_img_url(cls, value: Optional[str]) -> Optional[str]:
            if value and not value.startswith("http"):
                relative_path = value.lstrip("/")
                return f"{get_config().site_link}/{relative_path}"
            return value
    

class StockTransferBase(BaseModel):
    id: int
    quantity: int
    status: TransferStatus
    updated_at: datetime 
    product_id: int
    branch_id: int
    created_at: datetime
    product: Product


   
class StockTransferResponse(BaseModel):
     data: List[StockTransferBase]
     count:int
     has_next: bool


class StockInboundItemBase(BaseModel):
    product_id: int = Field(..., ge=0, description="Valid Product ID")
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class StockInboundItemCreate(StockInboundItemBase):
    pass


class StockInboundItemResponse(StockInboundItemBase):
    id: int
    inbound_id: int

    class Config:
        from_attributes = True


# -------------------------------------------------------------------
# 2. INBOUND HEADER SCHEMAS
# -------------------------------------------------------------------
class StockInboundCreate(BaseModel):
    invoice_no: str = Field(..., min_length=1, max_length=100, description="Unique Invoice Number")
    branch_id: int | None= Field(None,  description="Branch ID (Null for Main Warehouse)")
    items: List[StockInboundItemCreate] = Field(..., min_length=1, description="At least one item is required")


class StockInboundUpdate(BaseModel):
    invoice_no: str = Field(..., min_length=1, max_length=100, description="Updated Invoice Number")
    items: List[StockInboundItemCreate] = Field(..., min_length=1, description="Updated items list")


class StockInboundResponse(BaseModel):
    id: int
    invoice_no: str
    branch_id: Optional[int] = None
    created_at: datetime
    items: List[StockInboundItemResponse]

    class Config:
        from_attributes = True