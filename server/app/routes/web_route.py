from typing import List, Optional

from fastapi import APIRouter, Form, UploadFile, File, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import asc, or_, select, func, desc
from app.utils.dependencies import admin_required, role_required
from app.database.db import get_db
from app.database.schema import Category, HeroSlider, Order, OrderItem, Product
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.utils.utils import delete_image_from_url, get_skip, has_next, save_image

from app.database.schema.user import UserRole
from app.models.web import BestCategory, BestProduct, HeroSliderResponse, ProductListResponse, ProductListResponse


webRouter = APIRouter(prefix="/webs", tags=["Webs"])
@webRouter.post("/hero-sliders", response_model=HeroSliderResponse, status_code=201, dependencies=[Depends( role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ]))])
async def create_hero_slider(
    is_active: bool = Form(True, description="Hero slider is active for web?" ),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        hero_slider = {"is_active": is_active}

        if image:
            img_path = await save_image(
                file=image,
                folder="HeroSlider",
                filename="HeroSlider"+ str(image.filename),
                quality=80,
            )
            hero_slider["img"] = img_path

        hero_slider = HeroSlider(**hero_slider)
        db.add(hero_slider)
        
        await db.commit()
        await db.refresh(hero_slider)
        return hero_slider

    except Exception as e:
        await db.rollback()
        print(f"Error creating HeroSlider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )



# --- Get All HeroSlider ---
@webRouter.get("/hero-sliders", response_model=List[HeroSliderResponse])
async def get_all_sliders(
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(HeroSlider))
        hero_slider = result.scalars().all()
         

        return hero_slider
    except Exception as e:
        print(f"Error fetching HeroSlider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )

class HeroSliderSwitch(BaseModel):
    is_active: bool


# --- Active status switch ---
@webRouter.put(
    "/hero-sliders/{slider_id}/active-switch",
    response_model=HeroSliderResponse,
    dependencies=[
        Depends(role_required([UserRole.admin, UserRole.warehouse_manager]))
    ],
)
async def toggle_hero_slider_status(
    slider_id: int,
    payload: HeroSliderSwitch,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(
            select(HeroSlider).where(HeroSlider.id == slider_id)
        )
        hero_slider = result.scalar_one_or_none()

        if not hero_slider:
            return JSONResponse(
                status_code=404, content={"message": "Hero slider not found"}
            )

        # Update active status
        hero_slider.is_active = payload.is_active

        await db.commit()
        await db.refresh(hero_slider)
        return hero_slider

    except Exception as e:
        await db.rollback()
        print(f"Error updating HeroSlider status: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"},
        )

# --- Update HeroSlider ---
@webRouter.put("/hero-sliders/{slider_id}", response_model=HeroSliderResponse, dependencies=[Depends( role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ]))])
async def update_slider(
    slider_id: int = Path(..., examples=[0], description='Slider Id'),
    is_active: bool | None = Form(None, description="Hero slider is active for web?" ),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(HeroSlider).where(HeroSlider.id == slider_id))
        hero_slider = result.scalar_one_or_none()

        if not hero_slider:
            return JSONResponse(
                status_code=404,
                content={"message": "Hero slider not found"}
            )

        if is_active != None:
            hero_slider.is_active = is_active

        if image:
            if hero_slider.img:
                delete_image_from_url(hero_slider.img)
            new_filename = await save_image(
                file=image,
                folder="HeroSlider",
                quality=80,
            )
            hero_slider.img = new_filename

        await db.commit()
        await db.refresh(hero_slider)
        return hero_slider

    except Exception as e:
        await db.rollback()
        print(f"Error updating HeroSlider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )

# --- Delete HeroSlider ---
@webRouter.delete("/hero-sliders/{slider_id}",status_code=204,dependencies=[Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ])
    )])
async def delete_brand(
    slider_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(HeroSlider).where(HeroSlider.id == slider_id))
        hero_slider = result.scalar_one_or_none()

        if not hero_slider:
            return JSONResponse(
                status_code=404,
                content={"message": "HeroSlider not found"}
            )

        if hero_slider.img:
            delete_image_from_url(hero_slider.img)

        await db.delete(hero_slider)
        await db.commit()
      

    except Exception as e:
        await db.rollback()
        print(f"Error deleting HeroSlider: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )


# ---------------- Top category ----------------
@webRouter.get("/top-categories", response_model=List[BestCategory])
async def get_top_categories(
    limit: int = Query(5, ge=1, le=50, description="Number of categories to fetch"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db)
):
    try:
  
        query = (
            select(
                Category.id,
                Category.name,
                Category.img,
                func.sum(OrderItem.qty).label("total_sold")
            )
            .join(Product, Product.category_id == Category.id)
            .join(OrderItem, OrderItem.product_id == Product.id)
            .group_by(Category.id, Category.name, Category.img) # All selected columns grouped to satisfy SQL strict mode
            .order_by(desc("total_sold"))
            .offset(offset)
            .limit(limit)
        )

        result = await db.execute(query)
        categories = result.mappings().all()

        return categories

    except Exception as e:
        print(f"Error fetching top selling categories: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "Failed to fetch top categories"}
        )


# ---------------- Best Products ----------------
@webRouter.get("/best-products", response_model=List[BestProduct])
async def get_best_products(
    db: AsyncSession = Depends(get_db)
):
    try:
        query = (
            select(
                Product.id,
                Product.sku_code,
                Product.name,
                Product.price,
                Product.thumbnail,
                Product.discount_percentage,
                Product.quantity,
                Product.is_buy_one_get_one,
                func.sum(OrderItem.qty).label("total_sold")
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
        )

        query = (
            query.group_by(Product.id)
            .order_by(desc("total_sold"))
            .limit(4)
        )

        result = await db.execute(query)
        products = result.mappings().all()

        return products

    except Exception as e:
        print(f"Error fetching top selling products: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"}
        )

# ---------------- Right side  ----------------
# ---------------- max and min price of product ----------------
# ---------------- category with product count  ----------------
@webRouter.get("/product-right-side")
async def get_right_side_data(db: AsyncSession = Depends(get_db)):
    try:
        # 1. Single query for MIN & MAX price scalar values directly from DB
        price_stats_query = select(
            func.max(Product.price).label("max_price"),
            func.min(Product.price).label("min_price")
        )

        # 2. Aggregated category list with total product count per category
        category_query = (
            select(
                Category.id,
                Category.name,
                Category.img,
                func.count(Product.id).label("product_count"),
            )
            .outerjoin(Product, Product.category_id == Category.id)
            .group_by(Category.id, Category.name, Category.img)
            .order_by(desc("product_count"))
        )

        # Execute both optimized queries
        price_res = await db.execute(price_stats_query)
        cat_res = await db.execute(category_query)

        prices = price_res.first()
        categories = cat_res.mappings().all()

        return {
            "max_price": float(prices.max_price) if prices and prices.max_price is not None else 0.0,
            "min_price": float(prices.min_price) if prices and prices.min_price is not None else 0.0,
            "category": categories,
        }

    except Exception as e:
        print(f"Error fetching right-side sidebar data: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Failed to retrieve sidebar data: {str(e)}"},
        )


@webRouter.get("/products", response_model=ProductListResponse)
async def get_products(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    sort: str = Query("latest", enum=["a-z", "z-a", "l-h", "h-l", "latest"]),
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    db: AsyncSession = Depends(get_db)
):
    try:
        skip = (page - 1) * limit

        # Base SELECT Query
        query = (
            select(
                Product.id,
                Product.sku_code,
                Product.name,
                Product.price,
                Product.thumbnail,
                Product.discount_percentage,
                Product.is_buy_one_get_one,
                Product.quantity,
                Product.brand_id,
                Category.id.label("category_id"),
                Category.name.label("category_name"),
            )
            .join(Category, Product.category_id == Category.id)
        )

        # Base Count Query
        count_query = select(func.count()).select_from(Product)

        # 1. Search Filter
        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # 2. Category Filter
        if category_id:
            query = query.where(Product.category_id == category_id)
            count_query = count_query.where(Product.category_id == category_id)

        # 3. Brand Filter
        if brand_id:
            query = query.where(Product.brand_id == brand_id)
            count_query = count_query.where(Product.brand_id == brand_id)

        # 4. Min & Max Price Range Filters
        if min_price is not None:
            query = query.where(Product.price >= min_price)
            count_query = count_query.where(Product.price >= min_price)

        if max_price is not None:
            query = query.where(Product.price <= max_price)
            count_query = count_query.where(Product.price <= max_price)

        # 5. Sorting
        if sort == "a-z":
            query = query.order_by(asc(Product.name))
        elif sort == "z-a":
            query = query.order_by(desc(Product.name))
        elif sort == "l-h":
            query = query.order_by(asc(Product.price))
        elif sort == "h-l":
            query = query.order_by(desc(Product.price))
        else:
            query = query.order_by(desc(Product.created_at))

        # Execute total count query
        total_count = (await db.execute(count_query)).scalar() or 0

        # Execute paginated data query
        result = await db.execute(query.offset(skip).limit(limit))

        return {
            "data": result.mappings().all(),
            "count": total_count,
            "has_next": total_count > (skip + limit)
        }

    except Exception as e:
        print(f"Error fetching product list: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "Failed to retrieve products", "error": str(e)}
        )

