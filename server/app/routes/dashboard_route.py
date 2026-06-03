from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status,Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc,case
from typing import List, Any
import logging

from app.database.db import get_db
from app.database.schema import Order, OrderItem, Product




dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)


@dashboard_router.get("/sales-overview")
async def get_sales_overview(db: AsyncSession = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc)
        today_date = now.date()
        yesterday_date = today_date - timedelta(days=1)
        seven_days_ago = today_date - timedelta(days=6)

        # 1. Chart Data (Last 7 Days)
        chart_query = (
            select(
                func.date(Order.created_at).label("date"),
                func.sum(case((Order.is_online == True, Order.total), else_=0)).label("online"),
                func.sum(case((Order.is_online == False, Order.total), else_=0)).label("offline")
            )
            .filter(func.date(Order.created_at) >= seven_days_ago)
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at))
        )
        
        chart_result = await db.execute(chart_query)
        chart_data = chart_result.all()

        # 2. Trend Calculation (Today vs Yesterday)
        trend_query = (
            select(
                func.sum(case((func.date(Order.created_at) == today_date, Order.total), else_=0)).label("today_total"),
                func.sum(case((func.date(Order.created_at) == yesterday_date, Order.total), else_=0)).label("yesterday_total")
            )
        )
        
        trend_result = await db.execute(trend_query)
        trend_data = trend_result.first()

        today_val = float(trend_data.today_total or 0)
        yesterday_val = float(trend_data.yesterday_total or 0)

        # Growth Formula: ((Today - Yesterday) / Yesterday) * 100
        growth_percentage = 0
        if yesterday_val > 0:
            growth_percentage = ((today_val - yesterday_val) / yesterday_val) * 100

        return {
            "sales_chart": [
                {"date": str(row.date), "online": float(row.online), "offline": float(row.offline)}
                for row in chart_data
            ],
            "trends": {
                "today_sales": today_val,
                "growth_percentage": round(growth_percentage, 2),
                "status": "up" if growth_percentage >= 0 else "down"
            }
        }

    except Exception as e:
        logger.error(f"Sales Overview Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={"message": "Error fetching sales overview data", "error": str(e)}
        )


@dashboard_router.get("/sales-charts")
async def get_sales_charts(db: AsyncSession = Depends(get_db)):
    try:
        now = datetime.now(timezone.utc)
        seven_days_ago = (now - timedelta(days=6)).date()

        
        chart_query = (
            select(
                func.date(Order.created_at).label("date"),
                func.sum(case((Order.is_online == True, Order.total), else_=0)).label("online"),
                func.sum(case((Order.is_online == False, Order.total), else_=0)).label("offline")
            )
            .filter(func.date(Order.created_at) >= seven_days_ago)
            .group_by(func.date(Order.created_at))
            .order_by(func.date(Order.created_at))
        )
        
        chart_result = await db.execute(chart_query)
        rows = chart_result.all()


        sales_overview_data = [
            {
                "name": row.date.strftime("%d %b"), # e.g., "10 May"
                "online": float(row.online or 0),
                "offline": float(row.offline or 0)
            } for row in rows
        ]

        
        total_query = (
            select(
                func.sum(case((Order.is_online == True, Order.total), else_=0)).label("online_total"),
                func.sum(case((Order.is_online == False, Order.total), else_=0)).label("offline_total"),
                func.sum(Order.total).label("grand_total")
            )
        )
        
        total_result = await db.execute(total_query)
        totals = total_result.first()

        grand_total = float(totals.grand_total or 0)
        online_val = float(totals.online_total or 0)
        offline_val = float(totals.offline_total or 0)


        online_percent = round((online_val / grand_total * 100), 1) if grand_total > 0 else 0
        offline_percent = round((offline_val / grand_total * 100), 1) if grand_total > 0 else 0

        donut_chart_data = [
            {"name": "Online", "value": online_percent, "amount": online_val},
            {"name": "Offline", "value": offline_percent, "amount": offline_val}
        ]

        return {
            "sales_overview": sales_overview_data,
            "donut_chart": {
                "data": donut_chart_data,
                "total_sales_amount": grand_total
            }
        }

    except Exception as e:
        logger.error(f"Charts Fetch Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={"message": "Error fetching chart data", "error": str(e)}
        )

@dashboard_router.get("/summary")
async def get_summary_stats(
    filter_type: str = Query("today", enum=["today", "weekly", "monthly"]),
    db: AsyncSession = Depends(get_db)
):
    try:
        now = datetime.now(timezone.utc)
        if filter_type == "today":
            start_date = now.date()
        elif filter_type == "weekly":
            start_date = (now - timedelta(days=7)).date()
        else: # monthly
            start_date = (now - timedelta(days=30)).date()

        query = (
            select(
                func.count(Order.id).label("total_orders"),
                func.sum(Order.total).label("total_sales"),
                func.sum(case((Order.is_online == True, Order.total), else_=0)).label("online_sales"),
                func.sum(case((Order.is_online == False, Order.total), else_=0)).label("offline_sales")
            )
            .filter(func.date(Order.created_at) >= start_date)
        )

        result = await db.execute(query)
        stats = result.first()

        return {
            "total_sales": float(stats.total_sales or 0),
            "total_orders": stats.total_orders or 0,
            "online_sales": float(stats.online_sales or 0),
            "offline_sales": float(stats.offline_sales or 0)
        }
    except Exception as e:
        logger.error(f"Summary Error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail={"message": "Error fetching summary statistics", "error": str(e)}
        )

@dashboard_router.get("/top-selling")
async def get_top_selling(db: AsyncSession = Depends(get_db)):
    try:
        query = (
            select(
                Product.name,
                Product.price,
                Product.thumbnail,
                func.sum(OrderItem.qty).label("total_sold")
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .group_by(Product.id)
            .order_by(desc("total_sold"))
            .limit(5)
        )
        result = await db.execute(query)
        products = result.all()
        
        return [
            {"name": p.name, "price": float(p.price), "sold": p.total_sold, "image": p.thumbnail}
            for p in products
        ]
    except Exception as e:
        logger.error(f"Error fetching top selling products: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


# --- 2. Low Stock Products (Limit 5) ---
@dashboard_router.get("/low-stock")
async def get_low_stock(db: AsyncSession = Depends(get_db)):
    try:

        query = (
            select(Product.id,
                Product.name,
                Product.quantity,
                Product.price,
                Product.thumbnail)
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
            } for p in products
        ]
    except Exception as e:
        logger.error(f"Error fetching low stock products: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch low stock data")


# --- 3. Recent Orders (Limit 10) ---
@dashboard_router.get("/recent-orders")
async def get_recent_orders(db: AsyncSession = Depends(get_db)):
    try:

        query = (
            select(Order)
            .order_by(Order.created_at.desc())
            .limit(10)
        )
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