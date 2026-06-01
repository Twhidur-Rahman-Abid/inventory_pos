from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
import logging


from app.database.db import get_db
from app.database.schema.product import Product, ProductDetail, ProductImage
from app.database.schema.user import User, UserRole
from app.utils.utils import delete_image_from_url, get_skip, has_next, save_image
from app.utils.dependencies import role_required
from app.models.product import ProductResponse, ProductListResponse, StockUpdate
from app.database.schema import Category

logger = logging.getLogger(__name__)
productRouter = APIRouter(prefix="/products", tags=["Products"])

# --- Create Product ---
@productRouter.post("/", status_code=201)
async def create_product(
    sku_code: str = Form(...),
    name: str = Form(...),
    category_id: int = Form(...),
    price: float = Form(...),
    discount_percentage: Optional[float] = Form(0),
    is_buy_one_get_one: Optional[bool] = Form(False),
    thumbnail: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    quantity: int = Form(0),
    images: Optional[List[UploadFile]] = File(None, description="At least one image is required"),
    current_user: User = Depends(role_required([UserRole.admin, UserRole.warehouse_manager])),
    db: AsyncSession = Depends(get_db)
):
    try:
        sku_check = await db.execute(select(Product).where(Product.sku_code == sku_code))
        if sku_check.scalar_one_or_none():
            return JSONResponse(status_code=400, content={"message": "SKU code already exists"})

        if thumbnail:
            thumbnail_path = await save_image(
                file=thumbnail,
                folder="products",
                filename=name,
                quality=80
                
            )
        new_product = Product(
            sku_code=sku_code,
            name=name,
            category_id=category_id,
            price=price,
            discount_percentage=discount_percentage,
            is_buy_one_get_one=is_buy_one_get_one,
            thumbnail=thumbnail_path if thumbnail else None,
            quantity=quantity
        )
        db.add(new_product)
        await db.flush() 

      
        new_detail = ProductDetail(product_id=new_product.id, description=description)
        db.add(new_detail)

        if images:
            for idx, img in enumerate(images):
            
                img_path = await save_image(
                    file=img,
                    folder="products",
                    filename=f"{sku_code}-{idx}",
                    quality=80
                )
                new_img = ProductImage(product_id=new_product.id, image_url=img_path)
                db.add(new_img)

        await db.commit()
        await db.refresh(new_product)
        return new_product

    except Exception as e:
        await db.rollback()
        logger.error(f"Product creation error: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Failed to create product"})


# --- Get Product List ---
@productRouter.get("/")
async def get_product_list(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    sort: str = Query("latest", enum=["a-z", "z-a", "l-h", "h-l", "latest"]),
    db: AsyncSession = Depends(get_db)
):
    query = select(
        Product.id,
        Product.sku_code,
        Product.name,
        Product.price,
        Product.thumbnail,
        Product.discount_percentage,
        Product.is_buy_one_get_one,
        Product.quantity,
    )

    # Search Product list bia name and sku code
    if search:
        query = query.where(or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku_code.ilike(f"%{search}%")
        ))

        count_query = count_query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
        )
    
    # Sort product
    if sort == "a-z":
        query = query.order_by(asc(Product.name))
    elif sort == "z-a":
        query = query.order_by(desc(Product.name))
    elif sort == "l-h":
        query = query.order_by(asc(Product.price))
    elif sort == "h-l":
        query = query.order_by(desc(Product.price))

    total_count = (
        await db.execute(
            select(func.count()).select_from(Product)
        )
    ).scalar()

    skip = (page - 1) * limit

    result = await db.execute(
        query.offset(skip).limit(limit)
    )

    return {
        "data": result.mappings().all(),
        "count": total_count,
    }

#  --- Get Product list with category id and name ---
@productRouter.get("/with-category")
async def get_product_list_with_category(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    sort: str = Query("latest", enum=["a-z", "z-a", "l-h", "h-l", "latest"]),
    category_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
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

            Category.id.label("category_id"),
            Category.name.label("category_name"),
        )
        .join(Category, Product.category_id == Category.id)
    )

    if search:
        query = query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
        )

        count_query = count_query.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
        )

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

    count_query = select(func.count()).select_from(Product)

    if category_id:
        query = query.where(Product.category_id == category_id)
        count_query = count_query.where(
         Product.category_id == category_id
        )

    
       

    total_count = (
        await db.execute(count_query)
    ).scalar()

    skip = (page - 1) * limit

    result = await db.execute(
        query.offset(skip).limit(limit)
    )

    return {
        "data": result.mappings().all(),
        "count": total_count,
    }

# --- Get product list with details product ---
@productRouter.get("/with-details", response_model=ProductListResponse)
async def get_products(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    sort: str = Query("latest", enum=["a-z", "z-a", "l-h", "h-l", "latest"]),
    category_id: Optional[int] = None,
    pagination: bool = True,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(Product).options(selectinload(Product.details),
            selectinload(Product.images),selectinload(Product.category)) 
        
        
        if search:
            query = query.where(Product.name.ilike(f"%{search}%"))
        if category_id:
            query = query.where(Product.category_id == category_id)

    
        if sort == "a-z":
            query = query.order_by(asc(Product.name))
        elif sort == "z-a":
            query = query.order_by(desc(Product.name))
        elif sort == "l-h":
            query = query.order_by(asc(Product.price))
        elif sort == "h-l":
            query = query.order_by(desc(Product.price))
        

    
        count_query = select(func.count()).select_from(query.subquery())
        total_count = (await db.execute(count_query)).scalar() or 0
        
        if not pagination:
                products = (await db.execute(query)).scalars().all()
                return {
                    "data": products,
                    "count": total_count,
                    "has_next": False
                }
        skip = get_skip(page, limit)
        result = await db.execute(query.offset(skip).limit(limit))
        products = result.scalars().all()

        return {
            "data": products,
            "count": total_count,
            "has_next": has_next(total_count, skip, limit)
        }
    except Exception as e:
        logger.error(f"Fetch products error: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Could not fetch products"})

# --- Get product details by id
@productRouter.get("/{id}", response_model=ProductResponse)
async def get_product(
    id: int ,
    db: AsyncSession = Depends(get_db)
):
    try:
        query = select(Product).options(selectinload(Product.details),
            selectinload(Product.images),selectinload(Product.category)).where(Product.id == id)
        
          
        result = await db.execute(query)
        product = result.scalar_one_or_none()

        if not product:
            JSONResponse(status_code=404, content={"message": "Product not found!"})

        return product
    except Exception as e:
        logger.error(f"Fetch products error: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Could not fetch products"})

# --- Edit Product ---
@productRouter.put("/{product_id}",response_model=ProductResponse)
async def update_product(
    product_id: int,
    sku_code: Optional[str] = Form(None),
    name: Optional[str] = Form(None),
    category_id: Optional[int] = Form(None),
    price: Optional[float] = Form(None),
    discount_percentage: Optional[float] = Form(None),
    is_buy_one_get_one: Optional[bool] = Form(None),
    description: Optional[str] = Form(None),
    quantity: Optional[int] = Form(None),

    thumbnail: Optional[UploadFile] = File(None),
    images: Optional[List[UploadFile]] = File(None),
    deleted_image_ids: Optional[List[int]] = Form(None),
    current_user: User = Depends(role_required([UserRole.admin, UserRole.warehouse_manager])),
    db: AsyncSession = Depends(get_db)
):
    try:

        query = await db.execute(
            select(Product)
            .options(selectinload(Product.details), selectinload(Product.images), selectinload(Product.category))
            .where(Product.id == product_id)
        )
        product = query.scalar_one_or_none()

        if not product:
            return JSONResponse(status_code=404, content={"message": "Product not found"})

    
        if sku_code: product.sku_code = sku_code
        if name: product.name = name
        if category_id: product.category_id = category_id
        if price: product.price = price
        if discount_percentage is not None: product.discount_percentage = discount_percentage
        if is_buy_one_get_one is not None: product.is_buy_one_get_one = is_buy_one_get_one
        if quantity is not None: product.quantity = quantity
      
        if description and product.details:
            product.details.description = description


        # update thumbnail
        if thumbnail:

            # old thumbnail delete
            delete_image_from_url(product.thumbnail)

            thumb_path = await save_image(
                file=thumbnail,
                folder="products/thumbnails",
                filename=product.name,
                quality=75
            )

            product.thumbnail = thumb_path

    
         # delete images
        
        # delete images
        if deleted_image_ids:

            img_query = await db.execute(
                select(ProductImage).where(
                    ProductImage.id.in_(deleted_image_ids),
                    ProductImage.product_id == product_id
                )
            )

            images_to_remove = img_query.scalars().all()

            for img in images_to_remove:

                # image file delete
                delete_image_from_url(img.image_url)

                # db row delete
                await db.delete(img)


          # add new images
        if images:

            for idx, image_file in enumerate(images):

                img_path = await save_image(
                    file=image_file,
                    folder="products",
                    filename=f"{product.sku_code}-{idx}",
                    quality=80
                )

                new_img_obj = ProductImage(
                    product_id=product.id,
                    image_url=img_path
                )

                db.add(new_img_obj)

     
        await db.commit()
        await db.refresh(product,attribute_names=["details","images","category"])
        
        return product

    except Exception as e:
        await db.rollback()
        return JSONResponse(status_code=500, content={"message": f"Update failed: {str(e)}"})

# --- Add Product Stock ---
@productRouter.put("/{product_id}/add-stock")
async def add_stock(
    product_id: int,
    quantity: StockUpdate,
    current_user: User = Depends(role_required([UserRole.admin, UserRole.warehouse_manager])),
    db: AsyncSession = Depends(get_db)
):
    try:

        query = await db.execute(select(Product).where(Product.id == product_id))
        product = query.scalar_one_or_none()

        if not product:
            return JSONResponse(status_code=404, content={"message": "Product not found"})
    
        product.quantity += quantity.quantity
      
        await db.commit()
        await db.refresh(product)
        
        return product

    except Exception as e:
        await db.rollback()
        return JSONResponse(status_code=500, content={"message": f"Update failed: {str(e)}"})


# --- Delete Product ---
@productRouter.delete("/{product_id}")
async def delete_product(
    product_id: int,
    current_user: User = Depends(role_required([UserRole.admin, UserRole.warehouse_manager])),
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if not product:
            return JSONResponse(status_code=404, content={"message": "Product not found"})
        
        if product.thumbnail:
            delete_image_from_url(product.thumbnail)

        await db.delete(product)
        await db.commit()
        return JSONResponse(status_code=200, content={"message": "Product deleted successfully"})
    
    except Exception as e:
        await db.rollback()
        logger.error(f"Delete product error: {str(e)}")
        return JSONResponse(status_code=500, content={"message": "Failed to delete product"})