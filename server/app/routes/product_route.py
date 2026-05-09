
from typing import Optional
from urllib.parse import parse_qs

from sqlalchemy import select, func

from fastapi import APIRouter,Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.database.schema.product import Product
from server.app.utils.utils import get_skip, has_next

productRouter = APIRouter(prefix="/products",tags=["Products"])


@productRouter.get("/")
async def index(page:int=0,limit:int=10,search:Optional[str]=None,db: AsyncSession= Depends(get_db)):
    query = select(Product)
    count_query = select(func.count()).select_from(Product)
    if search:
        query = query.where(Product.name.contains(search))
    skip = get_skip(page,limit)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    count = await db.execute(count_query).scaler() or 0

    return {"products": result.scalars().all(), "count": count, "has_next": has_next(count, skip, limit)}


@productRouter.post("/")
async def create_product(product:int, db: AsyncSession= Depends(get_db)):
    pass