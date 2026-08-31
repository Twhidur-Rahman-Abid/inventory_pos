from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, String, cast
from sqlalchemy.orm import selectinload
from typing import Optional, Any
from decimal import Decimal
from fastapi.responses import JSONResponse

from app.database.schema.order import Order,OrderItem, OrderStatus
from app.database.schema.customer import Customer
from app.models.order import OrderCreate, OrderStatusUpdate, OrderDetailsResponse
from app.database.db import get_db
from app.database.schema import Product, Stock, User
from app.models.user import UserRole
from app.routes.auth_route import role_required
from app.utils.dependencies import get_current_user




orderRouter = APIRouter(prefix="/orders", tags=["Orders"])



# =========================
# Create order
# =========================
# =========================
# Create order
# =========================
# =========================
# Create order
# =========================
@orderRouter.post(
    "/",
    status_code=201,
)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager,
            UserRole.shop_manager,
            UserRole.shop_staff
        ])
    )
):
    try:
        total = Decimal("0.00")

        # Determine user role and assign appropriate branch ID
        is_branch_user = current_user.role in [
            UserRole.shop_manager,
            UserRole.shop_staff
        ]

        branch_id = (
            current_user.branch_id
            if is_branch_user
            else payload.branch_id
        )

        # Initialize base Order object
        order = Order(
            customer_id=payload.customer_id,
            branch_id=branch_id,
            extra_discount=payload.extra_discount,
            delivery=payload.delivery,
            is_online=payload.is_online,
            cash_amount=payload.cash_amount,
            other_payment_method=payload.other_payment_method,
            other_payment_amount=payload.other_payment_amount,
            note=payload.note,
            status=(
                OrderStatus.PROCESSING
                if payload.is_online
                else OrderStatus.COMPLETED
            ),
            total=0
        )

        db.add(order)
        await db.flush()

        # Process each item in the payload
        for item in payload.items:
            product = await db.scalar(
                select(Product)
                .where(Product.id == item.product_id)
                .with_for_update()
            )

            if not product:
                return JSONResponse(
                    status_code=404,
                    content={
                        "message": f"Product {item.product_id} not found"
                    }
                )

            # Calculate actual quantities (Handle Buy 1 Get 1)
            ordered_qty = item.qty
            delivered_qty = item.qty
            
            if product.is_buy_one_get_one:
                delivered_qty = ordered_qty * 2

            # Branch stock validation
            if is_branch_user:
                stock = await db.scalar(
                    select(Stock)
                    .where(
                        Stock.product_id == product.id,
                        Stock.branch_id == branch_id
                    )
                    .with_for_update()
                )

                if not stock:
                    return JSONResponse(
                        status_code=404,
                        content={
                            "message": f"No stock found for {product.name}"
                        }
                    )

                if stock.qty < delivered_qty:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "message": "Not enough stock",
                            "detail": (
                                f"{product.name} available stock: "
                                f"{stock.qty}"
                            )
                        }
                    )
            # Warehouse stock validation
            else:
                if product.quantity < delivered_qty:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "message": "Not enough stock",
                            "detail": (
                                f"{product.name} available stock: "
                                f"{product.quantity}"
                            )
                        }
                    )

            # Calculate unit selling price and original price based on discount rules
            base_unit_price = Decimal(str(product.price))
            selling_price = base_unit_price
            original_price = None
            discount_type = None

            # Case 1: Percentage Discount
            if product.discount_percentage:
                discount_type = f"{product.discount_percentage}% off"
                original_price = float(base_unit_price)
                selling_price = base_unit_price - (
                    base_unit_price
                    * Decimal(str(product.discount_percentage))
                    / Decimal("100")
                )
            # Case 2: Buy 1 Get 1 (Splits unit price across total delivered items)
            elif product.is_buy_one_get_one:
                discount_type = "buy 1 get 1"
                original_price = float(base_unit_price)
                selling_price = base_unit_price / Decimal("2")

            # Calculate line item subtotal and accumulate total
            subtotal = selling_price * Decimal(delivered_qty)
            total += subtotal

            # Deduct stock based on user context
            if is_branch_user and stock:
                stock.qty -= delivered_qty
            else:
                product.quantity -= delivered_qty

            # Add OrderItem record
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    qty=delivered_qty,
                    selling_price=float(selling_price),
                    original_price=original_price,
                    discount_type=discount_type
                )
            )

        # Apply delivery charges and overall extra discount percentage
        total = (
            (total + Decimal(str(payload.delivery)))
            - (
                (total + Decimal(str(payload.delivery)))
                * Decimal(str(payload.extra_discount))
                / Decimal("100")
            )
        )

        if total < 0:
            total = Decimal("0")

        # Validate total payments against calculated total order balance
        cash_paid = Decimal(str(payload.cash_amount))
        other_paid = Decimal(str(payload.other_payment_amount))
        total_paid = cash_paid + other_paid

        if total_paid != total.quantize(Decimal("0.01")):
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Total payment amount must equal the order total balance."
                }
            )

        # Validate complementary payment methods and amounts
        if other_paid > 0 and not payload.other_payment_method:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Please select a payment method for the additional payment amount."
                }
            )

        if payload.other_payment_method and other_paid <= 0:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Please enter an amount for the selected payment method."
                }
            )

        # Set final calculated order total
        order.total = float(total)

        await db.commit()

        # Fetch created order with relationships
        result = await db.execute(
            select(Order)
            .options(
                selectinload(Order.customer),
                selectinload(Order.items)
                .selectinload(OrderItem.product)
            )
            .where(Order.id == order.id)
        )

        order = result.scalar_one_or_none()

        return {
            "message": "Order created successfully",
            "data": order
        }

    except Exception as e:
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred",
                "detail": str(e)
            }
        )
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    offset = (page - 1) * limit

    branch_id = current_user.branch_id

    query = (
        select(Order)
        .options(
            selectinload(Order.customer)
        ).where(Order.is_online == False)
    )

    if current_user.role != UserRole.admin:
        query=query.where(Order.branch_id == branch_id)

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
    current_user: Any = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    offset = (page - 1) * limit

    branch_id = current_user.branch_id

    query = (
        select(Order)
        .options(
            selectinload(Order.customer)
        ).where(Order.is_online == True)
    )

    if current_user.role != UserRole.admin:
        query=query.where(Order.branch_id == branch_id)

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


@orderRouter.get("/{order_id}/details",
                 # response_model=OrderDetailsResponse
                  )
async def get_order_details(
    order_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = await db.execute(
        select(Order)
        .options(
            selectinload(Order.customer),
            selectinload(Order.items).selectinload(OrderItem.product)
        )
        .where(Order.id == order_id)
    )
    order = query.scalar_one_or_none()
    if not order:
        return JSONResponse(
            status_code=404,
            content={"message": "Order not found"}
        )
    return {"data": order}
