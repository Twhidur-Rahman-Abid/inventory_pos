from pydantic import BaseModel

class CreditSchema(BaseModel):
    customer_id: int
    amount: float

class DueSchema(BaseModel):
    customer_id: int
    amount: float