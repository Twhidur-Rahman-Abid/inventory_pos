import os

from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from fastapi.responses import JSONResponse 
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database.db import get_db
from app.database.schema.category import Category
from sqlalchemy import select, func
import logging

from app.utils.utils import BASE_UPLOAD_DIR, delete_image_from_url, get_skip, has_next, save_image
from app.models.category import CategoryResponse, CategoryCreate
from app.database.schema.user import UserRole, User
from app.utils.dependencies import role_required 

logger = logging.getLogger(__name__)

categoryRouter = APIRouter(prefix="/categories", tags=["Categories"])

# --- Create Category ---
@categoryRouter.post("/", response_model=CategoryCreate)
async def create_category(
    name: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Category).where(Category.name == name))
        if result.scalar_one_or_none():
            return JSONResponse(
                status_code=400,
                content={"message": "Internal server error occurred!"}
            )

        category_data = {"name": name}

        if image:
            img_path = await save_image(
                file=image,
                folder="categories",
                filename=name,
                quality=80,
            )
            category_data["img"] = img_path

        new_category = Category(**category_data)
        db.add(new_category)
        
        await db.commit()
        await db.refresh(new_category)
        return new_category

    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating category: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )


# --- Get All Categories ---
@categoryRouter.get("/", response_model=CategoryResponse)
async def get_categories(
    page: int = 1,
    limit: int = 10,
    pagination: bool = False,
    db: AsyncSession = Depends(get_db)
):
    try:
        count_val = await db.execute(select(func.count(Category.id)))
        count = count_val.scalar() or 0
        if pagination:
            skip = get_skip(page, limit)
            result = await db.execute(select(Category).offset(skip).limit(limit))
            categories = result.scalars().all()
            has_next_val = has_next(count, skip, limit)
        else:
            result = await db.execute(select(Category))
            categories = result.scalars().all()
            has_next_val = False

        return {
            "data": categories,
            "count": count,
            "has_next": has_next_val
        }
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )

# --- Update Category ---
@categoryRouter.put("/{category_id}", response_model=CategoryCreate)
async def update_category(
    category_id: int,
    name: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Category).where(Category.id == category_id))
        db_category = result.scalar_one_or_none()

        if not db_category:
            return JSONResponse(
                status_code=404,
                content={"message": "Category not found"}
            )

        if name:
            db_category.name = name

        if image:
            if db_category.img:
                delete_image_from_url(db_category.img)
            new_filename = await save_image(
                file=image,
                folder="categories",
                filename=db_category.name,
                quality=80,
            )
            db_category.img = new_filename

        await db.commit()
        await db.refresh(db_category)
        return db_category

    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating category: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )

# --- Delete Category ---
@categoryRouter.delete("/{category_id}",status_code=204,dependencies=[Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ])
    )])
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Category).where(Category.id == category_id))
        db_category = result.scalar_one_or_none()

        if not db_category:
            return JSONResponse(
                status_code=404,
                content={"message": "Category not found"}
            )

        if db_category.img:
            delete_image_from_url(db_category.img)

        await db.delete(db_category)
        await db.commit()
      

    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting category: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal server error occurred!"}
        )