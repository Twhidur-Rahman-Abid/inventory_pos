from fastapi import APIRouter, Depends,  Query
from sqlalchemy import   select, func, or_, asc, desc
from sqlalchemy.orm import selectinload, load_only
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from fastapi.responses import JSONResponse

from app.database.schema import (
    Category,
    StockTransfer,
    Product,
    Stock
)
from app.database.schema.stock import TransferStatus
from app.models.stock import SendStockSchema
from app.models.user import UserRole
from app.utils.dependencies import get_current_user, role_required
from app.database.schema.user import User

stockRouter = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)


@stockRouter.post("/send", dependencies=[Depends(role_required([UserRole.warehouse_manager, UserRole.admin]))])
async def send_stock(
    payload: SendStockSchema,
    db: AsyncSession = Depends(get_db),
):
 

        # lock warehouse product row

        product = await db.scalar(
            select(Product)
            .where(Product.id == payload.product_id)
            .with_for_update()
        )

        if not product:
            return JSONResponse(
                status_code=404,
                content={"message": "Product not found"}
            )

        if product.quantity < payload.quantity:
            return JSONResponse(
                status_code=400,
                content={"message": "Insufficient warehouse stock"}
            )

        product.quantity -= payload.quantity

        transfer = StockTransfer(
            product_id=payload.product_id,
            branch_id=payload.branch_id,
            quantity=payload.quantity,
            status=TransferStatus.PENDING,
        )

        db.add(transfer)
        await db.commit()
        await db.refresh(transfer)

        return {
            "message": "Stock sent successfully"
        }




@stockRouter.post("/{transfer_id}/accept")
async def accept_stock(
    transfer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.shop_manager, UserRole.shop_staff]))
):
  

    transfer = await db.scalar(
        select(StockTransfer)
        .where(
            StockTransfer.id == transfer_id
        )
    )

    if not transfer:
        return JSONResponse(
            status_code=404,
            content={"message": "Transfer not found"}
        )

    if transfer.branch_id != current_user.branch_id:
        return JSONResponse(
            status_code=403,
            content={"message": "Not authorized to accept this transfer"}
        )

    if transfer.status != TransferStatus.PENDING:
        return JSONResponse(
            status_code=400,
            content={"message": "Transfer already processed"}
        )

    stock = await db.scalar(
        select(Stock)
        .where(
            Stock.product_id == transfer.product_id,
            Stock.branch_id == transfer.branch_id
        )
    )

    if stock:

        stock.qty += transfer.quantity

    else:

        stock = Stock(
            product_id=transfer.product_id,
            branch_id=transfer.branch_id,
            qty=transfer.quantity
        )

        db.add(stock)

    transfer.status = TransferStatus.ACCEPTED
     
    await db.commit()
  

    return {
        "message": "Transfer accepted"
    }

@stockRouter.post("/{transfer_id}/cancel")
async def cancel_stock(
    transfer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.shop_manager, UserRole.shop_staff]))
):


    transfer = await db.scalar(
        select(StockTransfer)
        .where(
            StockTransfer.id == transfer_id
        )
        .with_for_update()
    )

    if not transfer:
        return JSONResponse(
            status_code=404,
            content={"message": "Transfer not found"}
        )

    if transfer.branch_id != current_user.branch_id:
        return JSONResponse(
            status_code=403,
            content={"message": "Not authorized to accept this transfer"}
        )

    if transfer.status != TransferStatus.PENDING:
        return JSONResponse(
            status_code=400,
            content={"message": "Transfer already processed"}
        )

    product = await db.scalar(
        select(Product)
        .where(
            Product.id == transfer.product_id
        )
    )

    if not product:
        return JSONResponse(
            status_code=404,
            content={"message": "Product not found"}
        )

    product.quantity += transfer.quantity

    transfer.status = TransferStatus.CANCELLED

    await db.commit()


    return {
        "message": "Transfer cancelled"
    }






@stockRouter.get(
    "/transfers",
  
)
async def get_transfers(
    page: int = 1,
    limit: int = 10,
    current_user:User=Depends(  role_required([
                UserRole.shop_manager,
                UserRole.shop_staff
            ])),
    db: AsyncSession = Depends(get_db)
):
    branch_id = current_user.branch_id

    skip = (page - 1) * limit

    filters = (
        StockTransfer.status == TransferStatus.PENDING,
        StockTransfer.branch_id == branch_id
    )

    # Count query
    total_count = await db.scalar(
        select(func.count())
        .select_from(StockTransfer)
        .where(*filters)
    ) or 0

    # Data query
    result = await db.execute(
        select(StockTransfer)
        .options(
            selectinload(
                StockTransfer.product
            ).load_only(
                Product.id,
                Product.name,
                Product.thumbnail
            )
        )
        .where(*filters)
        .order_by(StockTransfer.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    transfers = result.scalars().all()

    return {
        "data": transfers,
        "count": total_count,
        "has_next": total_count > (skip + limit)
    }



@stockRouter.get("")
async def get_stocks(
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    pagination: bool = True,
    sort: str = Query("latest", enum=["a-z", "z-a", "latest"]),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    skip = (page - 1) * limit

    role = current_user.role

    # -----------------------------
    # ADMIN / WAREHOUSE VIEW
    # -----------------------------
    if role == UserRole.admin or role == UserRole.warehouse_manager:

        query = (
        select(Product)
        .options(
            load_only(
                Product.id,
                Product.sku_code,
                Product.name,
                Product.price,
                Product.thumbnail,
                Product.discount_percentage,
                Product.is_buy_one_get_one,
                Product.quantity,
                Product.category_id,
                Product.created_at,
            ),
            selectinload(Product.category).load_only(
                Category.id,
                Category.name,
            )
            )
        )

        count_query = select(func.count()).select_from(Product)

        if search:
            condition = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
            query = query.where(condition)
            count_query = count_query.where(condition)

        if sort == "a-z":
            query = query.order_by(asc(Product.name))
        elif sort == "z-a":
            query = query.order_by(desc(Product.name))
        else:
            query = query.order_by(desc(Product.id))

        total = await db.scalar(count_query) or 0

        if not pagination:
            result = await db.execute(query)
            products = result.scalars().all()

            return {
                "data": products,
                "count": total,
                "has_next": False
            }

        result = await db.execute(
            query.offset(skip).limit(limit)
        )

        data = result.scalars().all()

        return {
            "mode": "warehouse",
            "data": data,
            "count": total,
            "has_next": total > skip + limit
        }

    # -----------------------------
    # BRANCH VIEW
    # -----------------------------
    branch_id = current_user.branch_id

    query = (
        select(Stock)
        .join(Product)
        .options(
            selectinload(Stock.product).load_only(
                Product.id,
                Product.sku_code,
                Product.name,
                Product.price,
                Product.thumbnail,
                Product.discount_percentage,
                Product.is_buy_one_get_one,
                Product.quantity,
                Product.category_id,
                Product.created_at,
            ).selectinload(Product.category)
            .load_only(
                Category.id,
                Category.name
            )
        )
        .where(Stock.branch_id == branch_id)
    )

    count_query = (
        select(func.count())
        .select_from(Stock)
        .where(Stock.branch_id == branch_id)
    )

    if search:
        condition = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku_code.ilike(f"%{search}%")
        )
        query = query.where(condition)
        count_query = count_query.where(condition)

    if sort == "a-z":
        query = query.order_by(asc(Product.name))
    elif sort == "z-a":
        query = query.order_by(desc(Product.name))
    else:
        query = query.order_by(desc(Stock.id))

    total = await db.scalar(count_query) or 0

    if not pagination:
        result = await db.execute(query)
        stocks = result.scalars().all()

        stocks_data = [
            {
                "id": stock.product.id,
                "sku_code": stock.product.sku_code,
                "name": stock.product.name,
                "price": stock.product.price,
                "discount_percentage": stock.product.discount_percentage,
                "is_buy_one_get_one": stock.product.is_buy_one_get_one,
                "thumbnail": stock.product.thumbnail,
                "category_id": stock.product.category_id,
                "quantity": stock.qty,  # 👈 stock table quantity
                "category": stock.product.category
            }
            for stock in stocks
        ]

        return {
            "data": stocks_data,
            "count": total,
            "has_next": False
        }

    result = await db.execute(
        query.offset(skip).limit(limit)
    )

    stocks = result.scalars().all()

    stocks_data = [
            {
                "id": stock.product.id,
                "sku_code": stock.product.sku_code,
                "name": stock.product.name,
                "price": stock.product.price,
                "discount_percentage": stock.product.discount_percentage,
                "is_buy_one_get_one": stock.product.is_buy_one_get_one,
                "thumbnail": stock.product.thumbnail,
                "category_id": stock.product.category_id,
                "quantity": stock.qty,  # 👈 stock table quantity
                "category": stock.product.category
            }
            for stock in stocks
        ]

    return {
        "mode": "branch",
        "data": stocks_data,
        "count": total,
        "has_next": total > skip + limit
    }