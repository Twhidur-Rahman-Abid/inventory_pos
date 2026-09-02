from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, String, update
from sqlalchemy.orm import selectinload, load_only
from typing import List, Literal, Optional, Any
from decimal import Decimal
from fastapi.responses import JSONResponse

from app.database.schema.order import Order,OrderItem, OrderStatus
from app.database.schema.customer import Customer
from app.models.order import BasicOrderPaginatedResponse, BasicOrderResponse, OrderCreate, OrderResponse, OrderStatusUpdate
from app.database.db import get_db
from app.database.schema import Branch, Product, Stock, User
from app.models.user import UserRole
from app.routes.auth_route import role_required
from app.utils.dependencies import get_current_user




orderRouter = APIRouter(prefix="/orders", tags=["Orders"])



# =========================
# Create order
# =========================
@orderRouter.post("/", status_code=201, response_model=OrderResponse)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        role_required(
            [
                UserRole.admin,
                UserRole.warehouse_manager,
                UserRole.shop_manager,
                UserRole.shop_staff,
            ]
        )
    ),
):
    try:
        # 1. Resolve Customer Logic
        customer_id: Optional[int] = payload.customer_id

        if payload.customer_phone:
            # Query only customer ID by phone number
            existing_customer_id = await db.scalar(
                select(Customer.id).where(
                    Customer.phone == payload.customer_phone
                )
            )

            if existing_customer_id:
                customer_id = existing_customer_id
            else:
                # Create a new customer if phone number doesn't exist
                new_customer = Customer(
                    name=payload.customer_name, phone=payload.customer_phone
                )
                db.add(new_customer)
                await db.flush()  # Populates new_customer.id
                customer_id = new_customer.id

        elif customer_id:
            # Verify customer exists when only customer_id is passed
            customer_exists = await db.scalar(
                select(Customer.id).where(Customer.id == customer_id)
            )
            if not customer_exists:
                return JSONResponse(
                    status_code=404,
                    content={
                        "message": f"Customer with ID {customer_id} not found."
                    },
                )

        # 2. Determine Branch Scope
        is_branch_user = current_user.role in [
            UserRole.shop_manager,
            UserRole.shop_staff,
        ]
        branch_id = (
            current_user.branch_id if is_branch_user else 1
        )

        # 3. Create initial Order Shell
        order = Order(
            customer_id=customer_id,
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
            total=0.0,
        )
        db.add(order)
        await db.flush()

        # Extract payload items into map for fast lookup
        item_qty_map = {item.product_id: item.qty for item in payload.items}
        product_ids = list(item_qty_map.keys())

        # 4. Fetch only required fields from Products (Row Locking applied)
        product_stmt = (
            select(
                Product.id,
                Product.name,
                Product.price,
                Product.quantity,
                Product.discount_percentage,
                Product.is_buy_one_get_one,
            )
            .where(Product.id.in_(product_ids))
            .with_for_update()
        )
        product_rows = (await db.execute(product_stmt)).all()

        if len(product_rows) != len(product_ids):
            found_ids = {p.id for p in product_rows}
            missing_ids = set(product_ids) - found_ids
            return JSONResponse(
                status_code=404,
                content={
                    "message": f"Products not found: {list(missing_ids)}"
                },
            )

        # 5. Fetch Branch Stock if branch user (Row Locking applied)
        stock_map = {}
        if is_branch_user:
            stock_stmt = (
                select(Stock)
                .where(
                    Stock.branch_id == branch_id,
                    Stock.product_id.in_(product_ids),
                )
                .with_for_update()
            )
            stocks = (await db.execute(stock_stmt)).scalars().all()
            stock_map = {s.product_id: s for s in stocks}

        # 6. Process Items and Calculations
        total = Decimal("0.00")
        order_items_to_create = []

        for p in product_rows:
            ordered_qty = item_qty_map[p.id]
            delivered_qty = (
                ordered_qty * 2 if p.is_buy_one_get_one else ordered_qty
            )

            # Stock Validation & Deduction
            if is_branch_user:
                stock_record = stock_map.get(p.id)
                if not stock_record:
                    return JSONResponse(
                        status_code=404,
                        content={
                            "message": f"No stock record found for {p.name}"
                        },
                    )
                if stock_record.qty < delivered_qty:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "message": "Not enough stock",
                            "detail": f"{p.name} available stock: {stock_record.qty}",
                        },
                    )
                stock_record.qty -= delivered_qty
            else:
                if p.quantity < delivered_qty:
                    return JSONResponse(
                        status_code=400,
                        content={
                            "message": "Not enough stock",
                            "detail": f"{p.name} available stock: {p.quantity}",
                        },
                    )
                # Bulk update main product quantity
                await db.execute(
                    update(Product)
                    .where(Product.id == p.id)
                    .values(quantity=Product.quantity - delivered_qty)
                )

            # Price & Discount Calculations
            base_unit_price = Decimal(str(p.price))
            selling_price = base_unit_price
            original_price = None
            discount_type = None

            if p.discount_percentage:
                discount_type = f"{p.discount_percentage}% off"
                original_price = float(base_unit_price)
                selling_price = base_unit_price - (
                    base_unit_price
                    * Decimal(str(p.discount_percentage))
                    / Decimal("100")
                )
            elif p.is_buy_one_get_one:
                discount_type = "buy 1 get 1"
                original_price = float(base_unit_price)
                selling_price = base_unit_price / Decimal("2")

            subtotal = selling_price * Decimal(delivered_qty)
            total += subtotal

            order_items_to_create.append(
                OrderItem(
                    order_id=order.id,
                    product_id=p.id,
                    qty=delivered_qty,
                    selling_price=float(selling_price),
                    original_price=original_price,
                    discount_type=discount_type,
                )
            )

        db.add_all(order_items_to_create)

        # 7. Overall Discount and Order Total Calculations
        delivery_dec = Decimal(str(payload.delivery))
        extra_disc_dec = Decimal(str(payload.extra_discount))
        gross_total = total + delivery_dec

        total = gross_total - (gross_total * extra_disc_dec / Decimal("100"))
        if total < 0:
            total = Decimal("0.00")

        # Payment validations
        cash_paid = Decimal(str(payload.cash_amount))
        other_paid = Decimal(str(payload.other_payment_amount))
        total_paid = cash_paid + other_paid

        if total_paid != total.quantize(Decimal("0.01")):
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Total payment amount must equal the order total balance."
                },
            )

        if other_paid > 0 and not payload.other_payment_method:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Please select a payment method for the additional payment amount."
                },
            )

        if payload.other_payment_method and other_paid <= 0:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Please enter an amount for the selected payment method."
                },
            )

        order.total = float(total)
        await db.commit()

        # 8. Fetch and return complete payload
        stmt = (
            select(Order)
            .options(
                load_only(
                    Order.id,
                    Order.total,
                    Order.delivery,
                    Order.extra_discount,
                    Order.cash_amount,
                    Order.other_payment_method,
                    Order.other_payment_amount,
                    Order.note,
                    Order.status,
                    Order.is_online,
                    Order.created_at,
                    Order.updated_at,
                ),
                selectinload(Order.customer).load_only(
                    Customer.id, Customer.name, Customer.phone
                ),
                selectinload(Order.branch).load_only(Branch.id, Branch.name),
                selectinload(Order.items)
                .load_only(
                    OrderItem.id,
                    OrderItem.discount_type,
                    OrderItem.original_price,
                    OrderItem.qty,
                    OrderItem.selling_price,
                )
                .selectinload(OrderItem.product)
                .load_only(Product.id, Product.sku_code, Product.name),
            )
            .where(Order.id == order.id)
        )

        result = await db.execute(stmt)
        created_order = result.scalar_one()
        # return created_order
        return {
            "message": "Order created successfully",
            "data": created_order,
        }

    except Exception as e:
        await db.rollback()
        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred",
                "detail": str(e),
            },
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
# Get offline basic order
# =========================
@orderRouter.get("/basic", response_model=BasicOrderPaginatedResponse)
async def get_basic_orders(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    order_type: Literal["offline", "online", "both"] = "offline",
    order_status: Optional[OrderStatus] = None,  
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Strict Access Check: Online & Both mode only for Admin & Warehouse Manager
    if order_type in ["online", "both"] and current_user.role not in [UserRole.admin, UserRole.warehouse_manager]:
        raise HTTPException(
            status_code=403,
            detail="Only Admin and Warehouse Manager can access online or combined orders."
        )

    offset = (page - 1) * limit

    query = select(Order).options(
        load_only(
            Order.id,
            Order.created_at,
            Order.note,
            Order.other_payment_method,
            Order.other_payment_amount,
            Order.cash_amount,
            Order.total,
            Order.status,
        )
    )

    # Order Type Filtering
    if order_type == "offline":
        query = query.where(Order.is_online == False)
    elif order_type == "online":
        query = query.where(Order.is_online == True)

    # Conditional Status Filter (Ignored if order_type is offline)
    if order_type != "offline" and order_status:
        query = query.where(Order.status == order_status)

    # Branch filter for regular branch users
    if current_user.role not in [UserRole.admin, UserRole.warehouse_manager]:
        query = query.where(Order.branch_id == current_user.branch_id)

    # Search Logic
    if search:
        query = (
            query
            .outerjoin(Customer, Order.customer_id == Customer.id)
            .where(
                or_(
                    Order.id.cast(String).ilike(f"%{search}%"),
                    Customer.phone.ilike(f"%{search}%"),
                    Customer.name.ilike(f"%{search}%")
                )
            )
        )

    # Count Query
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query) or 0

    # Fetch Paginated Data
    query = (
        query
        .order_by(Order.id.desc())
        .offset(offset)
        .limit(limit)
    )

    result = await db.execute(query)
    orders = result.scalars().all()

    return {
        "count": total,
        "data": orders
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
