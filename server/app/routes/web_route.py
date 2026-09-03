from typing import List, Optional

from fastapi import APIRouter, Form, UploadFile, File, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.utils.dependencies import admin_required, role_required
from app.database.db import get_db
from app.database.schema import Category, HeroSlider, Order, OrderItem, Product
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.utils.utils import delete_image_from_url, get_skip, has_next, save_image

from app.database.schema.user import UserRole
from app.models.web import BestCategory, BestProduct, HeroSliderResponse


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


# ---------------- Top category ----------------
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
            content={"message","Internal Server Error"}
        )

