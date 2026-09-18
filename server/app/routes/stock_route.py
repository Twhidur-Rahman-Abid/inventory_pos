import logging
from typing import Optional

from fastapi import APIRouter, Depends,  Query, status
from sqlalchemy import   select, func, or_, asc, desc
from sqlalchemy.orm import selectinload, load_only, joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.db import get_db
from fastapi.responses import JSONResponse
from app.models.product import ProductListResponse

from app.database.schema import (
    Branch,
    Branch,
    Category,
    StockTransfer,
    Product,
    Stock
)
from app.database.schema.stock import StockInbound, StockInboundItem, StockTransferItem, TransferStatus
from app.models.stock import SendStockSchema, StockInboundCreate, StockTransferResponse
from app.models.user import UserRole
from app.utils.dependencies import get_current_user, role_required
from app.database.schema.user import User
from app.utils.sse_manager import notify_branch
from sqlalchemy.exc import SQLAlchemyError

stockRouter = APIRouter(
    prefix="/stocks",
    tags=["Stocks"]
)

logger = logging.getLogger(__name__)


# @stockRouter.post("/send", dependencies=[Depends(role_required([UserRole.warehouse_manager, UserRole.admin]))])
# async def send_stock(
#     payload: SendStockSchema,
#     db: AsyncSession = Depends(get_db),
# ):
#     try:
#         # 1. Lock warehouse product row for safe concurrent updates
#         product = await db.scalar(
#             select(Product)
#             .where(Product.id == payload.product_id)
#             .with_for_update()
#         )

#         if not product:
#             return JSONResponse(
#                 status_code=404,
#                 content={"message": "Product not found"}
#             )

#         if product.quantity < payload.quantity:
#             return JSONResponse(
#                 status_code=400,
#                 content={"message": "Insufficient warehouse stock"}
#             )

#         # 2. Update stock and create stock transfer entry
#         product.quantity -= payload.quantity

#         transfer = StockTransfer(
#             product_id=payload.product_id,
#             branch_id=payload.branch_id,
#             quantity=payload.quantity,
#             status=TransferStatus.PENDING,
#         )

#         db.add(transfer)
        
#         # 3. Commit transaction to database
#         await db.commit()
#         await db.refresh(transfer)

#         # 4. Push SSE Notification to the specific target branch
#         try:
#             await notify_branch(
#                 branch_id=payload.branch_id,
#                 message={
#                     "type": "stock_transfer",
#                     "text": f"New stock received for product: {product.name}"
#                 }
#             )
#         except Exception as sse_err:
#             # Non-blocking log: Stock transfer success holeo SSE fail korle DB rollback hobe na
#             print(f"Failed to send SSE notification to branch {payload.branch_id}: {sse_err}")

#         return {
#             "message": "Stock sent successfully",
#             "transfer_id": transfer.id
#         }

#     except SQLAlchemyError as db_err:
#         await db.rollback()
#         print(f"Database error in send_stock: {db_err}")
#         return JSONResponse(
#             status_code=500,
#             content={"message","Database transaction failed while transferring stock"}
#         )
#     except Exception as err:
#         await db.rollback()
#         print(f"Unexpected error in send_stock: {err}")
#         return JSONResponse(
#             status_code=500,
#             content={"message","An unexpected error occurred while processing stock transfer"}
#         )

@stockRouter.post("/send", dependencies=[Depends(role_required([UserRole.warehouse_manager, UserRole.admin]))])
async def send_stock(
    payload: SendStockSchema,
    db: AsyncSession = Depends(get_db),
):
    try:
        # 1. Extract IDs and map quantities for O(1) lookup
        items_map = {item.product_id: item.quantity for item in payload.items}
        product_ids = list(items_map.keys())

        # 2. OPTIMIZATION: Lock and fetch ALL requested products in a single SQL round-trip
        stmt = (
            select(Product)
            .where(Product.id.in_(product_ids))
            .with_for_update()
        )
        res = await db.execute(stmt)
        products = res.scalars().all()

        # 3. Validate product existence
        if len(products) != len(product_ids):
            found_ids = {p.id for p in products}
            missing_ids = set(product_ids) - found_ids
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": f"Products not found for IDs: {list(missing_ids)}"}
            )

        # 4. Create Transfer Header
        transfer = StockTransfer(
            branch_id=payload.branch_id,
            status=TransferStatus.PENDING
        )
        db.add(transfer)
        await db.flush()  # Generates transfer.id

        transferred_products_summary = []

        # 5. In-Memory validation and updates (No DB queries inside loop)
        for product in products:
            requested_qty = items_map[product.id]

            if product.quantity < requested_qty:
                await db.rollback()
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"message": f"Insufficient stock for product: {product.name}"}
                )

            # Deduct stock from central warehouse
            product.quantity -= requested_qty

            # Add transfer item
            transfer_item = StockTransferItem(
                transfer_id=transfer.id,
                product_id=product.id,
                quantity=requested_qty
            )
            db.add(transfer_item)
            transferred_products_summary.append(f"{product.name} (x{requested_qty})")

        # 6. Commit single atomic transaction
        await db.commit()
        await db.refresh(transfer)

        # 7. Non-blocking SSE Notification
        try:
            items_text = ", ".join(transferred_products_summary)
            await notify_branch(
                branch_id=payload.branch_id,
                message={
                    "type": "stock_transfer",
                    "text": f"New stock transfer dispatch: {items_text}"
                }
            )
        except Exception as sse_err:
            logger.error(f"Failed to send SSE notification to branch {payload.branch_id}: {sse_err}")

        return {
            "message": "Stock sent successfully",
            "transfer_id": transfer.id
        }

    except SQLAlchemyError as db_err:
        await db.rollback()
        logger.error(f"Database error in send_stock: {db_err}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Database transaction failed while transferring stock"}
        )
    except Exception as err:
        await db.rollback()
        logger.error(f"Unexpected error in send_stock: {err}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "An unexpected error occurred while processing stock transfer"}
        )


# ===================================================================
# 1. ACCEPT STOCK TRANSFER
# ===================================================================
@stockRouter.post("/{transfer_id}/accept")
async def accept_stock(
    transfer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.shop_manager, UserRole.shop_staff]))
):
    try:
        # Fetch transfer record with all nested line items
        transfer = await db.scalar(
            select(StockTransfer)
            .options(selectinload(StockTransfer.items))
            .where(StockTransfer.id == transfer_id)
            .with_for_update()
        )

        if not transfer:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Transfer not found"}
            )

        if transfer.branch_id != current_user.branch_id:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"message": "Not authorized to accept this transfer"}
            )

        if transfer.status != TransferStatus.PENDING:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": f"Transfer is already {transfer.status.value}"}
            )

        # Process each item in the transfer and update branch stock
        product_ids = [item.product_id for item in transfer.items]
        
        # Batch query existing branch stock records
        existing_stocks_res = await db.execute(
            select(Stock).where(
                Stock.branch_id == transfer.branch_id,
                Stock.product_id.in_(product_ids)
            )
        )
        existing_stocks = {s.product_id: s for s in existing_stocks_res.scalars().all()}

        for item in transfer.items:
            if item.product_id in existing_stocks:
                existing_stocks[item.product_id].qty += item.quantity
            else:
                new_stock = Stock(
                    product_id=item.product_id,
                    branch_id=transfer.branch_id,
                    qty=item.quantity
                )
                db.add(new_stock)

        # Mark header status as accepted
        transfer.status = TransferStatus.ACCEPTED
        await db.commit()

        return {"message": "Stock transfer accepted successfully", "transfer_id": transfer.id}

    except SQLAlchemyError as db_err:
        await db.rollback()
        logger.error(f"Database error during transfer accept: {db_err}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Failed to accept stock transfer due to database error"}
        )


# ===================================================================
# 2. CANCEL STOCK TRANSFER
# ===================================================================
@stockRouter.post("/{transfer_id}/cancel")
async def cancel_stock(
    transfer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(role_required([UserRole.shop_manager, UserRole.shop_staff]))
):
    try:
        # Fetch transfer header along with items
        transfer = await db.scalar(
            select(StockTransfer)
            .options(selectinload(StockTransfer.items))
            .where(StockTransfer.id == transfer_id)
            .with_for_update()
        )

        if not transfer:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"message": "Transfer not found"}
            )

        if transfer.branch_id != current_user.branch_id:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"message": "Not authorized to cancel this transfer"}
            )

        if transfer.status != TransferStatus.PENDING:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"message": f"Transfer is already {transfer.status.value}"}
            )

        # Restore deducted quantity back to central product inventory
        items_map = {item.product_id: item.quantity for item in transfer.items}
        product_ids = list(items_map.keys())

        products_res = await db.execute(
            select(Product)
            .where(Product.id.in_(product_ids))
            .with_for_update()
        )
        products = products_res.scalars().all()

        for product in products:
            product.quantity += items_map[product.id]

        # Update status to cancelled
        transfer.status = TransferStatus.CANCELLED
        await db.commit()

        return {"message": "Stock transfer cancelled and quantities restored to central stock", "transfer_id": transfer.id}

    except SQLAlchemyError as db_err:
        await db.rollback()
        logger.error(f"Database error during transfer cancel: {db_err}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Failed to cancel stock transfer due to database error"}
        )





@stockRouter.get("/transfers")
async def get_transfers(
    page: int = 1,
    limit: int = 10,
    status_filter: Optional[TransferStatus] = Query(None, description="Filter by transfer status"),
    current_user: User = Depends(
        role_required([UserRole.shop_manager, UserRole.shop_staff, UserRole.admin, UserRole.warehouse_manager])
    ),
    db: AsyncSession = Depends(get_db)
):
    try:
        skip = (page - 1) * limit

        # Base Filters
        conditions = []

        # 1. Role-based scoping
        if current_user.role in [UserRole.shop_manager, UserRole.shop_staff]:
            conditions.append(StockTransfer.branch_id == current_user.branch_id)

        # 2. Status Filter Logic (If 'all', ignore status condition)
        if status_filter:
            conditions.append(StockTransfer.status == status_filter)

        # Total Count Query
        count_stmt = (
            select(func.count())
            .select_from(StockTransfer)
            .where(*conditions)
        )
        total_count = await db.scalar(count_stmt) or 0

        # Optimized Data Query with Branch, Line Items and Product
        data_stmt = (
            select(StockTransfer)
            .options(
                load_only(
                    StockTransfer.id,
                    StockTransfer.branch_id,
                    StockTransfer.status,
                    StockTransfer.created_at,
                    StockTransfer.updated_at
                ),
                # Load Branch Info (id and name)
                selectinload(StockTransfer.branch)
                .load_only(
                    Branch.id,
                    Branch.name
                ),
                # Load Items and Product Info
                selectinload(StockTransfer.items)
                .load_only(
                    StockTransferItem.id,
                    StockTransferItem.transfer_id,
                    StockTransferItem.product_id,
                    StockTransferItem.quantity
                )
                .selectinload(StockTransferItem.product)
                .load_only(
                    Product.id,
                    Product.sku_code,
                    Product.name,
                    Product.price,
                    Product.thumbnail
                )
            )
            .where(*conditions)
            .order_by(StockTransfer.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(data_stmt)
        transfers = result.scalars().unique().all()

        return {
            "data": transfers,
            "count": total_count,
            "has_next": total_count > (skip + limit)
        }

    except Exception as e:
        logger.error(f"Error fetching stock transfers: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Failed to fetch stock transfers", "error": str(e)}
        )



@stockRouter.get("/", response_model=ProductListResponse)
async def get_stocks(
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    pagination: bool = True,
    sort: str = Query("latest", enum=["a-z", "z-a", "latest"]),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)  
):
    skip = (page - 1) * limit

    role = current_user.role

    # -----------------------------
    # ADMIN / WAREHOUSE VIEW
    # -----------------------------
    if role == UserRole.admin or role == UserRole.warehouse_manager:

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

        count_query = select(func.count()).select_from(Product)

        if search:
            condition = or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku_code.ilike(f"%{search}%")
            )
            query = query.where(condition)
            count_query = count_query.where(condition)

        if sort == "a-z":
            query = query.order_by(asc(Product.name))
        elif sort == "z-a":
            query = query.order_by(desc(Product.name))
        else:
            query = query.order_by(desc(Product.id))

        total = await db.scalar(count_query) or 0

        if not pagination:
            result = await db.execute(query)
            products = result.scalars().all()

            return {
                "data": products,
                "count": total,
                "has_next": False
            }

        result = await db.execute(
            query.offset(skip).limit(limit)
        )

        data = result.scalars().all()

        return {
            "data": data,
            "count": total,
            "has_next": total > skip + limit
        }

    # -----------------------------
    # BRANCH VIEW
    # -----------------------------
    branch_id = current_user.branch_id

    query = (
        select(Stock)
        .join(Product)
        .options(
            selectinload(Stock.product).load_only(
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
            ).selectinload(Product.category)
            .load_only(
                Category.id,
                Category.name
            )
        )
        .where(Stock.branch_id == branch_id)
    )

    count_query = (
        select(func.count())
        .select_from(Stock)
        .where(Stock.branch_id == branch_id)
    )

    if search:
        condition = or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku_code.ilike(f"%{search}%")
        )
        query = query.where(condition)
        count_query = count_query.where(condition)

    if sort == "a-z":
        query = query.order_by(asc(Product.name))
    elif sort == "z-a":
        query = query.order_by(desc(Product.name))
    else:
        query = query.order_by(desc(Stock.id))

    total = await db.scalar(count_query) or 0

    if not pagination:
        result = await db.execute(query)
        stocks = result.scalars().all()

        stocks_data = [
            {
                "id": stock.product.id,
                "sku_code": stock.product.sku_code,
                "name": stock.product.name,
                "price": stock.product.price,
                "discount_percentage": stock.product.discount_percentage,
                "is_buy_one_get_one": stock.product.is_buy_one_get_one,
                "thumbnail": stock.product.thumbnail,
                "category_id": stock.product.category_id,
                "quantity": stock.qty,  # 👈 stock table quantity
                "category": stock.product.category
            }
            for stock in stocks
        ]

        return {
            "data": stocks_data,
            "count": total,
            "has_next": False
        }

    result = await db.execute(
        query.offset(skip).limit(limit)
    )

    stocks = result.scalars().all()

    stocks_data = [
            {
                "id": stock.product.id,
                "sku_code": stock.product.sku_code,
                "name": stock.product.name,
                "price": stock.product.price,
                "discount_percentage": stock.product.discount_percentage,
                "is_buy_one_get_one": stock.product.is_buy_one_get_one,
                "thumbnail": stock.product.thumbnail,
                "category_id": stock.product.category_id,
                "quantity": stock.qty,  # 👈 stock table quantity
                "category": stock.product.category
            }
            for stock in stocks
        ]

    return {
        "data": stocks_data,
        "count": total,
        "has_next": total > skip + limit
    }


# -------------------------------------------------------------------
# 1. READ STOCKS (Only User's Specific Branch)
# -------------------------------------------------------------------
# ==========================================
# Get Paginated Inbound Invoices with Joins
# ==========================================
@stockRouter.get("/inbounds")
async def get_stock_inbound_list(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        offset = (page - 1) * limit

        # Select only required fields using load_only
        query = (
            select(StockInbound)
            .options(
                load_only(
                    StockInbound.id,
                    StockInbound.invoice_no,
                    StockInbound.branch_id,
                    StockInbound.created_at
                ),
                joinedload(StockInbound.branch).load_only(Branch.id, Branch.name),
                selectinload(StockInbound.items)
                .load_only(StockInboundItem.id, StockInboundItem.quantity)
                .joinedload(StockInboundItem.product)
                .load_only(
                    Product.id,
                    Product.sku_code,
                    Product.name,
                    Product.price,
                    Product.quantity
                )
            )
        )

        # RBAC Filtering
        if current_user.role not in [UserRole.admin, UserRole.warehouse_manager]:
            query = query.where(StockInbound.branch_id == current_user.branch_id)

        # Invoice Search Filter
        if search:
            query = query.where(StockInbound.invoice_no.ilike(f"%{search}%"))

        # Total Count Query
        count_query = select(func.count()).select_from(query.subquery())
        total_count = await db.scalar(count_query) or 0

        # Execute Paginated Query
        paginated_query = (
            query
            .order_by(StockInbound.id.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await db.execute(paginated_query)
        inbounds = result.scalars().unique().all()

        return {
            "count": total_count,
            "data": inbounds
        }

    except Exception as e:
        logger.error(f"Error fetching stock inbounds: {e}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": "Failed to retrieve stock inbounds", "error": str(e)}
        )


# -------------------------------------------------------------------
# 2. CREATE STOCK INBOUND (Adds Quantity to Product/Branch Stock)
# -------------------------------------------------------------------
@stockRouter.post("/inbounds", status_code=201)
async def create_stock_inbound(
    payload: StockInboundCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Default to Branch 1 (Main Warehouse) if branch_id is omitted
        target_branch_id = payload.branch_id if payload.branch_id is not None else 1

        # Check for duplicate invoice number
        existing_invoice = await db.execute(
            select(StockInbound).where(StockInbound.invoice_no == payload.invoice_no)
        )
        if existing_invoice.scalar_one_or_none():
            return JSONResponse(
                status_code=400,
                content={"message": f"Invoice '{payload.invoice_no}' already exists."}
            )

        # Create inbound header record
        inbound = StockInbound(
            invoice_no=payload.invoice_no,
            branch_id=target_branch_id
        )
        db.add(inbound)
        await db.flush()

        # Process each inbound item and update inventory
        for item in payload.items:
            inbound_item = StockInboundItem(
                inbound_id=inbound.id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(inbound_item)

            product = await db.get(Product, item.product_id)
            if not product:
                await db.rollback()
                return JSONResponse(
                    status_code=400,
                    content={"message": f"Product ID {item.product_id} not found."}
                )

            # Update central product catalog quantity for warehouse entries
            if target_branch_id == 1:
                product.quantity += item.quantity

            # Upsert branch stock record
            stock_stmt = select(Stock).where(
                Stock.product_id == item.product_id,
                Stock.branch_id == target_branch_id
            )
            stock_res = await db.execute(stock_stmt)
            branch_stock = stock_res.scalar_one_or_none()

            if branch_stock:
                branch_stock.qty += item.quantity
            else:
                new_branch_stock = Stock(
                    product_id=item.product_id,
                    branch_id=target_branch_id,
                    qty=item.quantity
                )
                db.add(new_branch_stock)

        await db.commit()
        return {
            "message": "Stock inbound created successfully", 
            "inbound_id": inbound.id,
            "processed_branch_id": target_branch_id
        }

    except Exception as e:
        await db.rollback()
        print(f"Error creating stock inbound: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "Failed to record stock inbound"}
        )


# # -------------------------------------------------------------------
# # 3. UPDATE STOCK INBOUND (Adjusts Quantity Differences)
# # -------------------------------------------------------------------
# @stockRouter.put("/inbounds/{inbound_id}")
# async def update_stock_inbound(
#     inbound_id: int,
#     payload: StockInboundUpdate,
#     db: AsyncSession = Depends(get_db)
# ):
#     try:
#         stmt = (
#             select(StockInbound)
#             .options(selectinload(StockInbound.items))
#             .where(StockInbound.id == inbound_id)
#         )
#         res = await db.execute(stmt)
#         inbound = res.scalar_one_or_none()

#         if not inbound:
#             return JSONResponse(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 content={"message": "Stock inbound record not found"}
#             )

#         # Reverse previous quantities before applying new ones
#         for old_item in inbound.items:
#             product = await db.get(Product, old_item.product_id)
#             if product:
#                 product.quantity -= old_item.quantity

#             if inbound.branch_id:
#                 stock_res = await db.execute(
#                     select(Stock).where(
#                         Stock.product_id == old_item.product_id,
#                         Stock.branch_id == inbound.branch_id
#                     )
#                 )
#                 b_stock = stock_res.scalar_one_or_none()
#                 if b_stock:
#                     b_stock.qty -= old_item.quantity

#             await db.delete(old_item)  # Delete old item rows

#         # Apply new updated values
#         inbound.invoice_no = payload.invoice_no
#         for new_item in payload.items:
#             db.add(StockInboundItem(
#                 inbound_id=inbound.id,
#                 product_id=new_item.product_id,
#                 quantity=new_item.quantity
#             ))

#             product = await db.get(Product, new_item.product_id)
#             if product:
#                 product.quantity += new_item.quantity

#             if inbound.branch_id:
#                 stock_res = await db.execute(
#                     select(Stock).where(
#                         Stock.product_id == new_item.product_id,
#                         Stock.branch_id == inbound.branch_id
#                     )
#                 )
#                 b_stock = stock_res.scalar_one_or_none()
#                 if b_stock:
#                     b_stock.qty += new_item.quantity

#         await db.commit()
#         return {"message": "Stock inbound updated and stock levels re-adjusted"}

#     except Exception as e:
#         await db.rollback()
#         logger.error(f"Error updating stock inbound: {e}")
#         return JSONResponse(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             content={"message": "Failed to update stock inbound", "error": str(e)}
#         )


# # -------------------------------------------------------------------
# # 4. DELETE STOCK INBOUND (Rolls back quantities)
# # -------------------------------------------------------------------
# @router.delete("/inbounds/{inbound_id}")
# async def delete_stock_inbound(
#     inbound_id: int,
#     db: AsyncSession = Depends(get_db)
# ):
#     try:
#         stmt = (
#             select(StockInbound)
#             .options(selectinload(StockInbound.items))
#             .where(StockInbound.id == inbound_id)
#         )
#         res = await db.execute(stmt)
#         inbound = res.scalar_one_or_none()

#         if not inbound:
#             return JSONResponse(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 content={"message": "Stock inbound record not found"}
#             )

#         # Rollback stock quantities for each item in the invoice
#         for item in inbound.items:
#             product = await db.get(Product, item.product_id)
#             if product:
#                 product.quantity = max(0, product.quantity - item.quantity)

#             if inbound.branch_id:
#                 stock_res = await db.execute(
#                     select(Stock).where(
#                         Stock.product_id == item.product_id,
#                         Stock.branch_id == inbound.branch_id
#                     )
#                 )
#                 b_stock = stock_res.scalar_one_or_none()
#                 if b_stock:
#                     b_stock.qty = max(0, b_stock.qty - item.quantity)

#         await db.delete(inbound)  # Deletes Header & Cascade deletes Items
#         await db.commit()

#         return {"message": "Stock inbound deleted and inventory rolled back successfully"}

#     except Exception as e:
#         await db.rollback()
#         logger.error(f"Error deleting stock inbound: {e}")
#         return JSONResponse(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             content={"message": "Failed to delete stock inbound", "error": str(e)}
#         )