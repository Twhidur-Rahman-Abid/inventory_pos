from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, status, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, asc, or_
from sqlalchemy.orm import selectinload, load_only
from typing import Literal, Optional, List
import logging
import csv
import io


from app.database.db import get_db
from app.database.schema.product import Product, ProductDetail, ProductImage
from app.database.schema.user import User, UserRole
from app.utils.utils import delete_image_from_url, get_skip, has_next, save_image
from app.utils.dependencies import role_required
from app.models.product import ProductDResponse, ProductDetailsList,  ProductListResponse, StockUpdate
from app.database.schema import Category, Order, OrderItem

logger = logging.getLogger(__name__)
productRouter = APIRouter(prefix="/products", tags=["Products"])

# --- Create Product ---
@productRouter.post("/", status_code=201)
async def create_product(
    sku_code: Optional[str] = Form(None),
    name: str = Form(...),
    category_id: int = Form(...),
    price: float = Form(...),
    discount_percentage: Optional[float] = Form(0),
    is_buy_one_get_one: Optional[bool] = Form(False),
    thumbnail: Optional[UploadFile] = File(None),
    description: Optional[str] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(role_required([UserRole.admin, UserRole.warehouse_manager])),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. If custom SKU is provided, validate uniqueness
        if sku_code:
            sku_check = await db.execute(select(Product).where(Product.sku_code == sku_code))
            result = sku_check.scalar_one_or_none()
            if result:
                return JSONResponse(
                    status_code=400,
                    content={"message": "SKU code already exists"}
                )

        # 2. Upload Thumbnail if present
        thumbnail_path = None
        if thumbnail:
            thumbnail_path = await save_image(
                file=thumbnail,
                folder="products",
                filename=sku_code or name,
                quality=80
            )

        # 3. Create initial Product record
        new_product = Product(
            sku_code=sku_code,
            name=name,
            category_id=category_id,
            price=price,
            discount_percentage=discount_percentage,
            is_buy_one_get_one=is_buy_one_get_one,
            thumbnail=thumbnail_path,
        )
        db.add(new_product)
        await db.flush()  # Generates auto-increment ID

        # 4. Fallback: If SKU was not provided, use the generated Product ID as SKU
        if not new_product.sku_code:
            new_product.sku_code = str(new_product.id)

        # 5. Create Product Detail if description exists
        if description:
            new_detail = ProductDetail(
                product_id=new_product.id,
                description=description
            )
            db.add(new_detail)

        # 6. Upload Gallery Images using final SKU
        if images:
            for idx, img in enumerate(images):
                img_path = await save_image(
                    file=img,
                    folder="products",
                    filename=f"{new_product.sku_code}-{idx}",
                    quality=80
                )
                new_img = ProductImage(
                    product_id=new_product.id,
                    image_url=img_path
                )
                db.add(new_img)

        await db.commit()
        await db.refresh(new_product)
        return new_product

    except Exception as e:
        await db.rollback()
        logger.error(f"Product creation error: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Failed to create product"}
        )


# ===================================================================
# BACKGROUND WORKER FUNCTION
# ===================================================================
# async def process_bulk_csv(csv_content: bytes):
#     """
#     Background worker that runs separately without blocking the HTTP request.
#     Creates its own DB session for safe transaction handling.
#     """
#     async with AsyncSessionLocal() as db:
#         try:
#             csv_file = io.StringIO(csv_content.decode("utf-8-sig"))
#             reader = csv.DictReader(csv_file)

#             created_count = 0
#             skipped_count = 0

#             for row in reader:
#                 name = row.get("name", "").strip()
#                 category_id = row.get("category_id", "").strip()
#                 price = row.get("price", "").strip()

#                 if not name or not category_id or not price:
#                     skipped_count += 1
#                     continue

#                 raw_sku = row.get("sku_code", "").strip() or None
#                 if raw_sku:
#                     existing_sku = await db.scalar(
#                         select(Product).where(Product.sku_code == raw_sku)
#                     )
#                     if existing_sku:
#                         skipped_count += 1
#                         continue

#                 brand_id = int(row["brand_id"].strip()) if row.get("brand_id", "").strip() else None
#                 discount = float(row["discount_percentage"].strip()) if row.get("discount_percentage", "").strip() else 0.0
#                 is_bogo = row.get("is_buy_one_get_one", "").strip().lower() in ["true", "1", "yes"]
#                 quantity = int(row["quantity"].strip()) if row.get("quantity", "").strip() else 0
#                 description = row.get("description", "").strip()

#                 new_product = Product(
#                     sku_code=raw_sku,
#                     name=name,
#                     category_id=int(category_id),
#                     price=float(price),
#                     discount_percentage=discount,
#                     is_buy_one_get_one=is_bogo,
#                     quantity=quantity,
#                     brand_id=brand_id
#                 )
#                 db.add(new_product)
#                 await db.flush()

#                 if not new_product.sku_code:
#                     new_product.sku_code = str(new_product.id)

#                 if description:
#                     new_detail = ProductDetail(
#                         product_id=new_product.id,
#                         description=description
#                     )
#                     db.add(new_detail)

#                 created_count += 1

#             await db.commit()
#             logger.info(f"Bulk CSV upload completed: {created_count} created, {skipped_count} skipped.")

#         except Exception as e:
#             await db.rollback()
#             logger.error(f"Error in background bulk upload: {str(e)}")


# # ===================================================================
# # FASTAPI ENDPOINT
# # ===================================================================
# @productRouter.post("/csv-upload", status_code=status.HTTP_202_ACCEPTED)
# async def csv_upload_products(
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
#     current_user: User = Depends(role_required([UserRole.admin, UserRole.warehouse_manager]))
# ):
#     if not file.filename.endswith('.csv'):
#         return JSONResponse(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             content={"message": "Invalid file format. Please upload a CSV file."}
#         )

#     # Read file content immediately before passing to background task
#     content = await file.read()

#     # Schedule background task
#     background_tasks.add_task(process_bulk_csv, content)

#     return {
#         "message": "File uploaded successfully. Processing started in the background."
#     }

# --- Get Product List ---
@productRouter.get("/", response_model=ProductListResponse)
async def get_product_list(
    page: int = 1,
    limit: int = 10,
    pagination: bool = True,
    search: Optional[str] = None,
    product_type: Literal["all", "discount", "buy_one_get_one", "percentage"] = Query(
        "all",
        description="Filter products by deal/discount type"
    ),
    sort: str = Query(
        "latest",
        enum=["a-z", "z-a", "l-h", "h-l", "latest"]
    ),
    db: AsyncSession = Depends(get_db)
):
    try:
        skip = (page - 1) * limit

        # Base query definition
        query = (
            select(Product)
            .options(
                load_only(
                    Product.id,
                    Product.sku_code,
                    Product.name,
                    Product.price,
                    Product.thumbnail,
                    Product.discount_percentage,
                    Product.is_buy_one_get_one,
                    Product.quantity,
                    Product.category_id,
                    Product.created_at,
                ),
                selectinload(Product.category).load_only(
                    Category.id,
                    Category.name,
                )
            )
        )

        # Base count query
        count_query = select(func.count()).select_from(Product)

        # 1. SEARCH FILTER
        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        # 2. PRODUCT TYPE FILTER
        if product_type == "discount":
            discount_filter = or_(
                Product.discount_percentage > 0,
                Product.is_buy_one_get_one == True
            )
            query = query.where(discount_filter)
            count_query = count_query.where(discount_filter)

        elif product_type == "buy_one_get_one":
            query = query.where(Product.is_buy_one_get_one == True)
            count_query = count_query.where(Product.is_buy_one_get_one == True)

        elif product_type == "percentage":
            query = query.where(Product.discount_percentage > 0)
            count_query = count_query.where(Product.discount_percentage > 0)

        # 3. SORTING
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

        # Execute total count
        total_count = (await db.execute(count_query)).scalar() or 0

        # 4. PAGINATION HANDLING
        if not pagination:
            result = await db.execute(query)
            products = result.scalars().all()

            return {
                "data": products,
                "count": total_count,
                "has_next": False
            }

        result = await db.execute(
            query.offset(skip).limit(limit)
        )

        products = result.scalars().all()

        return {
            "data": products,
            "count": total_count,
            "has_next": total_count > (skip + limit)
        }

    except Exception as e:
        logger.error(f"Error fetching product list: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "Failed to retrieve product list",
                "error": str(e)
            }
        )


# --- Get Product List ---
@productRouter.get("/sku")
async def search_product_with_sku(
    search: str = Query(..., description="Sku code or name", examples="NS-001"),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Base query definition
        query = (
            select(Product)
            .options(
                load_only(
                    Product.id,
                    Product.sku_code,
                    Product.name,
                    Product.thumbnail,
                    Product.quantity,
                )
            )
        )

        # Base count query
        count_query = select(func.count()).select_from(Product)

        search_filter = or_(
                Product.sku_code.ilike(f"%{search}%"),
                Product.name.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)
      
       
        # Execute total count
        total_count = (await db.execute(count_query)).scalar() or 0


        result = await db.execute(query)
        products = result.scalars().all()

        return {
                "data": products,
                "count": total_count,
        }

        

    except Exception as e:
        logger.error(f"Error fetching product list: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "Failed to retrieve product list",
             
            }
        )

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

    count_query = select(func.count()).select_from(Product)
    
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
@productRouter.get("/with-details", response_model=ProductDetailsList)
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
@productRouter.get("/{id}", response_model=ProductDResponse)
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
@productRouter.put("/{product_id}",response_model=ProductDResponse)
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