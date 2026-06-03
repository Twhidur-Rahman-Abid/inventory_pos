from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, String, cast
from sqlalchemy.orm import selectinload
from typing import Optional
from decimal import Decimal
from fastapi.responses import JSONResponse

from app.database.schema.order import Order,OrderItem, OrderStatus
from app.database.schema.customer import Customer
from app.models.order import OrderCreate, OrderStatusUpdate
from app.database.db import get_db
from app.database.schema import Product
from app.models.user import UserRole
from app.routes.auth_route import role_required




orderRouter = APIRouter(prefix="/orders", tags=["Orders"])




# =========================
# Create Order
# =========================

@orderRouter.post("/",status_code=201, dependencies=[Depends(role_required([UserRole.admin, UserRole.warehouse_manager, UserRole.shop_manager, UserRole.shop_staff]))])
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    try:

        total = Decimal("0.00")

        order = Order(
            customer_id=payload.customer_id,
            branch_id=payload.branch_id,
            extra_discount=payload.extra_discount,
            delivery=payload.delivery,
            is_online=payload.is_online,
            payment_method=payload.payment_method,
            note=payload.note,
            status=OrderStatus.PROCESSING if payload.is_online else OrderStatus.COMPLETED,
            total=0
        )

        db.add(order)

        await db.flush()

        for item in payload.items:

            product_query = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )

            product = product_query.scalar_one_or_none()

            if not product:
                return JSONResponse(status_code=404, content={'message':f"Product {item.product_id} not found"})

            if product.quantity < item.qty:
                return JSONResponse(status_code=404, content={'message':f"Not enough stock", 'detail':f"Not enough stock for {product.name}"})
               

            subtotal = Decimal(product.price) * item.qty

            total += subtotal

            product.quantity -= item.qty

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                qty=item.qty,
                price=product.price
            )

            db.add(order_item)

        total = (
            total
            + Decimal(payload.delivery)
            - Decimal(payload.extra_discount)
        )

        order.total = float(total)

        await db.commit()

        await db.refresh(order)

        return {
            "message": "Order created successfully",
            "data": order
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# Get Order List
# =========================


@orderRouter.get("/")
async def get_orders(
    page: int = 1,
    limit: int = 10,

    with_items: bool = False,

    branch_id: Optional[int] = None,
    customer_id: Optional[int] = None,

    search: Optional[str] = None,

    db: AsyncSession = Depends(get_db)
):

    offset = (page - 1) * limit

    query = (
        select(Order)
        .options(
            selectinload(Order.customer)
        ).where(Order.is_online == False)
    )

    # with items
    if with_items:
        query = query.options(
            selectinload(Order.items)
        )

    # filter by branch
    if branch_id:
        query = query.where(
            Order.branch_id == branch_id
        )

    # filter by customer
    if customer_id:
        query = query.where(
            Order.customer_id == customer_id
        )

    # search
    if search:

        query = (
            query
            .join(Customer, isouter=True)
            .where(
                or_(
                    Order.id.cast(String).ilike(f"%{search}%"),
                    Customer.phone.ilike(f"%{search}%"),
                    Customer.name.ilike(f"%{search}%")
                )
            )
        )

    # total count
    count_query = select(func.count()).select_from(
        query.subquery()
    )

    total = await db.scalar(count_query)

    # pagination
    query = (
        query
        .order_by(Order.id.desc())
        .offset(offset)
        .limit(limit)
    )

    orders = await db.execute(query)

    return {
        "count": total,
        "data": orders.scalars().all()
    }

@orderRouter.get("/online")
async def get__online_orders(
    page: int = 1,
    limit: int = 10,

    with_items: bool = False,

    branch_id: Optional[int] = None,
    customer_id: Optional[int] = None,

    search: Optional[str] = None,

    db: AsyncSession = Depends(get_db)
):

    offset = (page - 1) * limit

    query = (
        select(Order)
        .options(
            selectinload(Order.customer)
        ).where(Order.is_online == True)
    )

    # with items
    if with_items:
        query = query.options(
            selectinload(Order.items)
        )

    # filter by branch
    if branch_id:
        query = query.where(
            Order.branch_id == branch_id
        )

    # filter by customer
    if customer_id:
        query = query.where(
            Order.customer_id == customer_id
        )

    # search
    if search:

        query = (
            query
            .join(Customer, isouter=True)
            .where(
                or_(
                    Order.id.cast(String).ilike(f"%{search}%"),
                    Customer.phone.ilike(f"%{search}%"),
                    Customer.name.ilike(f"%{search}%")
                )
            )
        )

    # total count
    count_query = select(func.count()).select_from(
        query.subquery()
    )

    total = await db.scalar(count_query)

    # pagination
    query = (
        query
        .order_by(Order.id.desc())
        .offset(offset)
        .limit(limit)
    )

    orders = await db.execute(query)

    return {
        "count": total,
        "page": page,
        "limit": limit,
        "data": orders.scalars().all()
    }


# =========================
# Update Order Status
# =========================
@orderRouter.put("/{order_id}/status", dependencies=[Depends(role_required([UserRole.admin, UserRole.warehouse_manager, UserRole.shop_manager, UserRole.shop_staff]))])
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db)
):

        try:
            query = await db.execute(
                select(Order).where(Order.id == order_id)
            )

            order = query.scalar_one_or_none()

            if not order:
                return JSONResponse(
                    status_code=404,
                    content={"message": "Order not found"}
                )

            order.status = payload.status

            await db.commit()

            await db.refresh(order)

            return {
                "message": "Status updated successfully",
                "data": order
            }
        except Exception as e: 
            await db.rollback()
            print('order status error',str(e))
            return JSONResponse(status_code=500, content={"message": "Server error occurred!"})
# =========================
# Get Order Items By Order ID
# =========================

@orderRouter.get("/{order_id}/items")
async def get_order_items(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):

    query = await db.execute(
        select(OrderItem)
        .where(OrderItem.order_id == order_id)
    )

    items = query.scalars().all()

    return {
        "data": items
    }



