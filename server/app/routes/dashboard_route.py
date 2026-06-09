from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc,case

import logging
from fastapi.responses import JSONResponse

from app.database.db import get_db
from app.database.schema import Order, OrderItem, Product, Stock, User
from app.models.user import UserRole
from app.utils.dependencies import role_required




dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)

# sales chart data
@dashboard_router.get("/sales-charts")
async def get_sales_charts(
    filter_type: str = Query(
        "Today",
        enum=["Today", "This_Week", "This_Month"]
    ),
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager,
            UserRole.shop_manager,
            UserRole.shop_staff
        ])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:

        today = datetime.now(timezone.utc).date()
        seven_days_ago = today - timedelta(days=6)

        # =========================
        # Branch condition (IMPORTANT FIX)
        # =========================
        base_conditions = []

        if current_user.role != UserRole.admin:
            base_conditions.append(
                Order.branch_id == current_user.branch_id
            )

        # =========================
        # SALES OVERVIEW (7 DAYS)
        # =========================
        chart_query = (
            select(
                func.date(Order.created_at).label("date"),
                func.sum(
                    case(
                        (Order.is_online == True, Order.total),
                        else_=0
                    )
                ).label("online"),
                func.sum(
                    case(
                        (Order.is_online == False, Order.total),
                        else_=0
                    )
                ).label("offline")
            )
            .where(
                func.date(Order.created_at) >= seven_days_ago,
                *base_conditions
            )
            .group_by(
                func.date(Order.created_at)
            )
            .order_by(
                func.date(Order.created_at)
            )
        )

        chart_result = await db.execute(chart_query)
        rows = chart_result.all()

        sales_map = {
            row.date: {
                "online": float(row.online or 0),
                "offline": float(row.offline or 0),
            }
            for row in rows
        }

        sales_overview_data = []

        for i in range(7):
            current_date = seven_days_ago + timedelta(days=i)

            day_sales = sales_map.get(
                current_date,
                {"online": 0, "offline": 0}
            )

            sales_overview_data.append({
                "name": current_date.strftime("%d %b"),
                "online": day_sales["online"],
                "offline": day_sales["offline"]
            })

        # =========================
        # FILTER LOGIC
        # =========================
        if filter_type == "Today":
            filter_start_date = today

        elif filter_type == "This_Week":
            filter_start_date = today - timedelta(days=6)

        else:
            filter_start_date = today.replace(day=1)

        # =========================
        # DONUT QUERY
        # =========================
        total_query = (
            select(
                func.sum(
                    case(
                        (Order.is_online == True, Order.total),
                        else_=0
                    )
                ).label("online_total"),
                func.sum(
                    case(
                        (Order.is_online == False, Order.total),
                        else_=0
                    )
                ).label("offline_total"),
                func.sum(Order.total).label("grand_total")
            )
            .where(
                func.date(Order.created_at) >= filter_start_date,
                *base_conditions
            )
        )

        total_result = await db.execute(total_query)
        totals = total_result.first()

        online_val = float(totals.online_total or 0)
        offline_val = float(totals.offline_total or 0)
        grand_total = float(totals.grand_total or 0)

        online_percent = (
            round((online_val / grand_total) * 100, 1)
            if grand_total > 0 else 0
        )

        offline_percent = (
            round((offline_val / grand_total) * 100, 1)
            if grand_total > 0 else 0
        )

        return {
            "sales_overview": sales_overview_data,
            "donut_chart": {
                "filter_type": filter_type,
                "data": [
                    {
                        "name": "Online",
                        "value": online_percent,
                        "amount": online_val
                    },
                    {
                        "name": "Offline",
                        "value": offline_percent,
                        "amount": offline_val
                    }
                ],
                "total_sales_amount": grand_total
            }
        }

    except Exception as e:
        logger.error(f"Charts Fetch Error: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error fetching chart data",
                "error": str(e)
            }
        )

# summery data  
@dashboard_router.get("/summary")
async def get_summary_stats(
    filter_type: str = Query(
        "Today",
        enum=["Today", "This_Week", "This_Month"]
    ),
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager,
            UserRole.shop_manager,
            UserRole.shop_staff
        ])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:
        today = datetime.now(timezone.utc).date()

        # Current Period
        if filter_type == "Today":
            start_date = today
            prev_start = today - timedelta(days=1)
            prev_end = today

        elif filter_type == "This_Week":
            start_date = today - timedelta(days=6)
            prev_start = start_date - timedelta(days=7)
            prev_end = start_date

        else:  # This_Month
            start_date = today.replace(day=1)
            prev_end = start_date
            prev_start = (
                start_date.replace(day=1) - timedelta(days=1)
            ).replace(day=1)

        current_conditions = [
            func.date(Order.created_at) >= start_date
        ]

        previous_conditions = [
            func.date(Order.created_at) >= prev_start,
            func.date(Order.created_at) < prev_end
        ]

        # Branch Filter
        if current_user.role != UserRole.admin:
            current_conditions.append(
                Order.branch_id == current_user.branch_id
            )
            previous_conditions.append(
                Order.branch_id == current_user.branch_id
            )

        # Current Stats
        current_query = (
            select(
                func.count(Order.id).label("total_orders"),
                func.sum(Order.total).label("total_sales"),
                func.sum(
                    case(
                        (Order.is_online == True, Order.total),
                        else_=0
                    )
                ).label("online_sales"),
                func.sum(
                    case(
                        (Order.is_online == False, Order.total),
                        else_=0
                    )
                ).label("offline_sales")
            )
            .where(*current_conditions)
        )

        current_result = await db.execute(current_query)
        current_stats = current_result.first()

        # Previous Stats
        previous_query = (
            select(
                func.count(Order.id).label("total_orders"),
                func.sum(Order.total).label("total_sales"),
                func.sum(
                    case(
                        (Order.is_online == True, Order.total),
                        else_=0
                    )
                ).label("online_sales"),
                func.sum(
                    case(
                        (Order.is_online == False, Order.total),
                        else_=0
                    )
                ).label("offline_sales")
            )
            .where(*previous_conditions)
        )

        previous_result = await db.execute(previous_query)
        previous_stats = previous_result.first()

        def calculate_growth(current, previous):
            current = float(current or 0)
            previous = float(previous or 0)

            if previous == 0:
                return {
                    "percentage": 100.0 if current > 0 else 0.0,
                    "type": "growth"
                }

            percentage = round(
                ((current - previous) / previous) * 100,
                2
            )

            return {
                "percentage": abs(percentage),
                "type": "growth" if percentage >= 0 else "fall"
            }

        total_sales_growth = calculate_growth(
            current_stats.total_sales,
            previous_stats.total_sales
        )

        total_orders_growth = calculate_growth(
            current_stats.total_orders,
            previous_stats.total_orders
        )

        online_sales_growth = calculate_growth(
            current_stats.online_sales,
            previous_stats.online_sales
        )

        offline_sales_growth = calculate_growth(
            current_stats.offline_sales,
            previous_stats.offline_sales
        )

        return {
          

            "total_sales": {
                "value": float(current_stats.total_sales or 0),
                **total_sales_growth
            },

            "total_orders": {
                "value": current_stats.total_orders or 0,
                **total_orders_growth
            },

            "online_sales": {
                "value": float(current_stats.online_sales or 0),
                **online_sales_growth
            },

            "offline_sales": {
                "value": float(current_stats.offline_sales or 0),
                **offline_sales_growth
            }
        }

    except Exception as e:
        logger.error(f"Summary Error: {str(e)}")

        raise JSONResponse(
            status_code=500,
            content={
                "message": "Error fetching summary statistics",
                "error": str(e)
            }
        )

# top selling data
@dashboard_router.get("/top-selling")
async def get_top_selling(
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager,
            UserRole.shop_manager,
            UserRole.shop_staff
        ])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:

        query = (
            select(
                Product.name,
                Product.price,
                Product.thumbnail,
                func.sum(OrderItem.qty).label("total_sold")
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
        )

        # =========================
        # Branch filter (IMPORTANT)
        # =========================
        conditions = []

        if current_user.role != UserRole.admin:
            conditions.append(
                Order.branch_id == current_user.branch_id
            )

        if conditions:
            query = query.where(*conditions)

        query = (
            query.group_by(Product.id)
            .order_by(desc("total_sold"))
            .limit(5)
        )

        result = await db.execute(query)
        products = result.all()

        return [
            {
                "name": p.name,
                "price": float(p.price),
                "sold": p.total_sold or 0,
                "image": p.thumbnail
            }
            for p in products
        ]

    except Exception as e:
        logger.error(f"Error fetching top selling products: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal Server Error"
        )

# low stock product (quantity<5)
@dashboard_router.get("/low-stock")
async def get_low_stock(
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager,
            UserRole.shop_manager,
            UserRole.shop_staff
        ])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:

        # =========================
        # ADMIN / WAREHOUSE → Product table
        # =========================
        if current_user.role in [UserRole.admin, UserRole.warehouse_manager]:

            query = (
                select(
                    Product.id,
                    Product.name,
                    Product.quantity,
                    Product.price,
                    Product.thumbnail
                )
                .where(Product.quantity < 5)
                .order_by(Product.quantity.asc())
                .limit(5)
            )

            result = await db.execute(query)
            products = result.all()

            return [
                {
                    "id": p.id,
                    "name": p.name,
                    "quantity": p.quantity,
                    "price": float(p.price),
                    "image": p.thumbnail
                }
                for p in products
            ]

        # =========================
        # BRANCH USERS → Stock table
        # =========================
        else:

            query = (
                select(
                    Product.id,
                    Product.name,
                    Stock.qty.label("quantity"),
                    Product.price,
                    Product.thumbnail
                )
                .join(Stock, Stock.product_id == Product.id)
                .where(
                    Stock.branch_id == current_user.branch_id,
                    Stock.qty < 5
                )
                .order_by(Stock.qty.asc())
                .limit(5)
            )

            result = await db.execute(query)
            products = result.all()

            return [
                {
                    "id": p.id,
                    "name": p.name,
                    "quantity": p.quantity,
                    "price": float(p.price),
                    "image": p.thumbnail
                }
                for p in products
            ]

    except Exception as e:
        logger.error(f"Error fetching low stock products: {e}")
        raise HTTPException(
            status_code=500,
            detail="Could not fetch low stock data"
        )

# --- 3. Recent Orders (Limit 10) ---
@dashboard_router.get("/recent-orders")
async def get_recent_orders( current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager,
            UserRole.shop_manager,
            UserRole.shop_staff
        ])
    ),db: AsyncSession = Depends(get_db)):
    try:


        query = (
            select(Order)
            .order_by(Order.created_at.desc())
            .limit(10)
        )

        if current_user.role not in [UserRole.admin,UserRole.warehouse_manager]:
            query=query.where(Order.branch_id == current_user.branch_id )

        result = await db.execute(query)
        orders = result.scalars().all()
        
        return [
            {
                "id": o.id,
                "customer": o.customer.name if o.customer else "Guest",
                "type": "Online" if o.is_online else "Offline",
                "amount": float(o.total),
                "date": o.created_at.strftime("%d-%b-%Y"),
                "status": o.status.value
            } for o in orders
        ]
    except Exception as e:
        logger.error(f"Error fetching recent orders: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving recent orders")