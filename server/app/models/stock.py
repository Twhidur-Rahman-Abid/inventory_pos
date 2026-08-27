from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.config import get_config
from app.database.schema.stock import TransferStatus


class StockCreate(BaseModel):
    product_id: int
    branch_id: int
    qty: int

class SendStockSchema(BaseModel):
    product_id: int
    branch_id: int
    quantity: int = Field(gt=0)

 
    

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