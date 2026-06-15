from fastapi import APIRouter,Depends
from app.models.coupon import CouponCreate, CouponResponse, CouponListResponse, CouponUpdate
from app.database.schema.user import UserRole
from app.routes.auth_route import role_required
from app.database.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.schema.coupon import Coupon
from sqlalchemy import select
from fastapi.responses import JSONResponse

couponRouter = APIRouter(prefix='/coupon',tags=['Coupon'])


# --- create coupon ---
@couponRouter.post(
    "/",
    status_code=201,
    response_model=CouponResponse,
    dependencies=[
        Depends(
            role_required([
                UserRole.admin
            ])
        )
    ]
)
async def create_coupon(
    payload: CouponCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        print("on:1")

        existing = await db.scalar(
            select(Coupon)
            .where(Coupon.code == payload.code)
        )

        if existing:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Coupon code already exists"
                }
            )
        print("on:2")
        coupon = Coupon(**payload.model_dump())

        db.add(coupon)

        await db.commit()
        await db.refresh(coupon)

        return coupon

    except Exception as e:
        await db.rollback()

        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred!",
                "detail": str(e)
            }
        )
    

# --- Get all coupon ---
@couponRouter.get(
    "/",
    response_model=CouponListResponse
)
async def get_coupons(
    db: AsyncSession = Depends(get_db)
):
    try:

        result = await db.execute(
            select(Coupon)
            .order_by(Coupon.created_at.desc())
        )

        coupons = result.scalars().all()

        return {
            "data": coupons
        }

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred!",
                "detail": str(e)
            }
        )
    
# --- Get single coupon ---
@couponRouter.get(
    "/{coupon_id}",
    response_model=CouponResponse
)
async def get_coupon(
    coupon_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:

        coupon = await db.scalar(
            select(Coupon)
            .where(Coupon.id == coupon_id)
        )

        if not coupon:
            return JSONResponse(
                status_code=404,
                content={
                    "message": "Coupon not found"
                }
            )

        return {
            "data": coupon
        }

    except Exception as e:

        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred!",
                "detail": str(e)
            }
        )
    

# --- Update coupon ---
@couponRouter.put(
    "/{coupon_id}",
    response_model=CouponResponse,
    dependencies=[
        Depends(
            role_required([
                UserRole.admin
            ])
        )
    ]
)
async def update_coupon(
    coupon_id: int,
    payload: CouponUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:

        coupon = await db.scalar(
            select(Coupon)
            .where(Coupon.id == coupon_id)
            .with_for_update()
        )

        if not coupon:
            return JSONResponse(
                status_code=404,
                content={
                    "message": "Coupon not found"
                }
            )

        for key, value in payload.model_dump(
            exclude_unset=True
        ).items():
            setattr(coupon, key, value)

        await db.commit()
        await db.refresh(coupon)

        return coupon

    except Exception as e:

        await db.rollback()

        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred!",
                "detail": str(e)
            }
        )
    

# --- Delete coupon ---
@couponRouter.delete(
    "/{coupon_id}",
    status_code=203,
    dependencies=[
        Depends(
            role_required([
                UserRole.admin
            ])
        )
    ]
)
async def delete_coupon(
    coupon_id: int,
    db: AsyncSession = Depends(get_db)
):
    try:

        coupon = await db.scalar(
            select(Coupon)
            .where(Coupon.id == coupon_id)
            .with_for_update()
        )

        if not coupon:
            return JSONResponse(
                status_code=404,
                content={
                    "message": "Coupon not found"
                }
            )

        await db.delete(coupon)

        await db.commit()

        return {
            "message": "Coupon deleted successfully"
        }

    except Exception as e:

        await db.rollback()

        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal server error occurred!",
                "detail": str(e)
            }
        )