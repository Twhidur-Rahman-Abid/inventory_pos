from typing import Optional

from fastapi import APIRouter, Form, UploadFile, File, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.utils.dependencies import admin_required, role_required
from app.database.db import get_db
from app.database.schema import Brands
from fastapi.responses import JSONResponse

from app.utils.utils import delete_image_from_url, get_skip, has_next, save_image
from app.models.brands import BrandResponse,  BrandsResponses
from app.database.schema.user import UserRole


brandRouter = APIRouter(prefix="/brands", tags=["Brands"])
@brandRouter.post("/", response_model=BrandResponse, status_code=201, dependencies=[Depends( role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ]))])
async def create_brand(
    name: str = Form(..., min_length=3,   max_length=100, examples=['Niamah Shop']  ),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Brands).where(Brands.name == name))
        if result.scalar_one_or_none():
            return JSONResponse(
                status_code=400,
                content={"message": "This brand already exist"}
            )

        brand_data = {"name": name}

        if image:
            img_path = await save_image(
                file=image,
                folder="brands",
                filename=name,
                quality=80,
            )
            brand_data["img"] = img_path

        new_category = Brands(**brand_data)
        db.add(new_category)
        
        await db.commit()
        await db.refresh(new_category)
        return new_category

    except Exception as e:
        await db.rollback()
        print(f"Error creating Brands: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )



# --- Get All Brands ---
@brandRouter.get("/", response_model=BrandsResponses)
async def get_brands(
    page: int = 1,
    limit: int = 10,
    pagination: bool = False,
    db: AsyncSession = Depends(get_db)
):
    try:
        count_val = await db.execute(select(func.count(Brands.id)))
        count = count_val.scalar() or 0
        if pagination:
            skip = get_skip(page, limit)
            result = await db.execute(select(Brands).offset(skip).limit(limit))
            brands = result.scalars().all()
            has_next_val = has_next(count, skip, limit)
        else:
            result = await db.execute(select(Brands))
            brands = result.scalars().all()
            has_next_val = False

        return {
            "data": brands,
            "count": count,
        }
    except Exception as e:
        print(f"Error fetching brands: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )

# --- Update Brands ---
@brandRouter.put("/{brandId}", response_model=BrandResponse, dependencies=[Depends( role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ]))])
async def update_brand(
    brandId: int = Path(..., examples=[0], description='Brand Id'),
    name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Brands).where(Brands.id == brandId))
        brand_data = result.scalar_one_or_none()

        if not brand_data:
            return JSONResponse(
                status_code=404,
                content={"message": "Brands not found"}
            )

        if name:
            brand_data.name = name

        if image:
            if brand_data.img:
                delete_image_from_url(brand_data.img)
            new_filename = await save_image(
                file=image,
                folder="brands",
                filename=brand_data.name,
                quality=80,
            )
            brand_data.img = new_filename

        await db.commit()
        await db.refresh(brand_data)
        return brand_data

    except Exception as e:
        await db.rollback()
        print(f"Error updating Brands: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )

# --- Delete Brands ---
@brandRouter.delete("/{brandId}",status_code=204,dependencies=[Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ])
    )])
async def delete_brand(
    brandId: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Brands).where(Brands.id == brandId))
        brand_data = result.scalar_one_or_none()

        if not brand_data:
            return JSONResponse(
                status_code=404,
                content={"message": "Brands not found"}
            )

        if brand_data.img:
            delete_image_from_url(brand_data.img)

        await db.delete(brand_data)
        await db.commit()
      

    except Exception as e:
        await db.rollback()
        print(f"Error deleting Brands: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )
