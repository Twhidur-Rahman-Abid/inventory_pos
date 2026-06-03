from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database.db import get_db
from app.database.schema.user import User, UserRole
from app.models.user import User as UserModel, UserPaginationResponse, UserResponse, UserUpdate,AdminUser
from typing import Optional
from app.utils.auth import hash_password
from app.utils.utils import get_skip, has_next
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import SQLAlchemyError
from fastapi.responses import JSONResponse

from app.utils.dependencies import admin_required
from app.config import get_config

userRouter = APIRouter(prefix="/users",tags=["Users"])

# --- Create Admin User ---
@userRouter.post("/admin",response_model=UserResponse,status_code=201)
async def create_admin_user(payload: AdminUser, db: AsyncSession = Depends(get_db)):
    if payload.role != UserRole.admin:
        return JSONResponse(
            status_code=400,
            content={
                "message": f"Only admin user can be created through this endpoint. role = {payload.role} is not allowed."
            }
        )

    if payload.admin_secret_key != get_config().admin_secret_key:
        return JSONResponse(
            status_code=403,
            content={
                "message": "Invalid admin secret key."
            }
        )
    
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return JSONResponse(
            status_code=400,
            content={
                "message": "Email already exists"
            }
        )

    result = await db.execute(
        select(User).where(User.mobile == payload.mobile)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return JSONResponse(
            status_code=400,
            content={
                "message": "Phone number already exists"
            }
        )

    hashed = hash_password(payload.password)
    print("Hashed Password:", hashed)
    user = User(
        name=payload.name,
        email=payload.email,
        mobile=payload.mobile,
        password=hashed,
        role=payload.role,
        branch_id=None
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user

# --- Create inventory user ---
@userRouter.post("/",response_model=UserResponse,status_code=201,dependencies=[Depends(admin_required)])
async def create_user(payload: UserModel, db: AsyncSession = Depends(get_db)):
    if payload.role == UserRole.admin:
        return JSONResponse(
            status_code=400,
            content={
                "message": "Admin user cannot be created through this endpoint."
            }
        )

    
    if  not payload.branch_id:
        return JSONResponse(
            status_code=400,
            content={
                "message": f"Branch ID is required for role {payload.role}."
            }
        )
    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return JSONResponse(
            status_code=400,
            content={
                "message": "Email already exists"
            }
        )


    result = await db.execute(
        select(User).where(User.mobile == payload.mobile)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return JSONResponse(
            status_code=400,
            content={
                "message": "Phone number already exists"
            }
        )

    hashed = hash_password(payload.password)
    print("Hashed Password:", hashed)
    user = User(
        name=payload.name,
        email=payload.email,
        mobile=payload.mobile,
        password=hashed,
        role=payload.role,
        branch_id=payload.branch_id
    )

    db.add(user)
    await db.commit()
    await db.refresh(user, attribute_names=["branch"])

    return user

# --- Get admin users ---
@userRouter.get("/admin", response_model=UserPaginationResponse,dependencies=[Depends(admin_required)])
async def get_admin_users(
    page: int = 1, 
    limit: int = 10,
    search: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    try:
        skip = get_skip(page, limit)

        # Base queries with eager loading
        data_query = select(User).options(selectinload(User.branch))
        count_query = select(func.count()).select_from(User)

        data_query = data_query.where(User.role == "admin")
        count_query = count_query.where(User.role == "admin")

        # Apply search filter
        if search:
            search_filter = or_(
                User.mobile.ilike(f"{search}%"), 
                User.email.ilike(f"{search}%"),
                User.name.ilike(f"{search}%"),
            )
            count_query = count_query.where(search_filter)
            data_query = data_query.where(search_filter)

        # Execute Count
        count_result = await db.execute(count_query)
        total_count = count_result.scalar() or 0

        # Execute Data Fetch
        result = await db.execute(data_query.offset(skip).limit(limit))
        users = result.scalars().all()

        return {
            "count": total_count,
            "page": page,
            "has_next": has_next(total_count, skip, limit),
            "data": users
        }

    except SQLAlchemyError as e:
        print(f"Database Error: {str(e)}") 
        return JSONResponse(
            status_code=500,
            content={
                "message": "Could not fetch users due to a database error. Please try again later."
            }
        )
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "An unexpected error occurred!"
            }
        )

# --- Get inventory users ---
@userRouter.get("/", response_model=UserPaginationResponse,dependencies=[Depends(admin_required)])
async def get_users(
    page: int = 1, 
    limit: int = 10,
    search: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    try:
        skip = get_skip(page, limit)

        # Base queries with eager loading
        data_query = select(User).options(selectinload(User.branch))
        count_query = select(func.count()).select_from(User)

        data_query = data_query.where(User.role != "admin")
        count_query = count_query.where(User.role != "admin")

        # Apply search filter
        if search:
            search_filter = or_(
                User.mobile.ilike(f"{search}%"), 
                User.email.ilike(f"{search}%"),
                User.name.ilike(f"{search}%"),
            )
            count_query = count_query.where(search_filter)
            data_query = data_query.where(search_filter)

        # Execute Count
        count_result = await db.execute(count_query)
        total_count = count_result.scalar() or 0

        # Execute Data Fetch
        result = await db.execute(data_query.offset(skip).limit(limit))
        users = result.scalars().all()

        return {
            "count": total_count,
            "page": page,
            "has_next": has_next(total_count, skip, limit),
            "data": users
        }

    except SQLAlchemyError as e:
        print(f"Database Error: {str(e)}") 
        return JSONResponse(
            status_code=500,
            content={
                "message": "Could not fetch users due to a database error. Please try again later."
            }
        )
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "An unexpected error occurred!"
            }
        )
    


# --- Get Inventory User by id ---
@userRouter.get("/{user_id}", response_model=UserResponse,dependencies=[Depends(admin_required)])
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    try:

        query = select(User).options(selectinload(User.branch)).where(User.id == user_id)
        
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user:

            return JSONResponse(
                status_code=404,
                content={
                    "message": "User not found"
                }
            )
        
        return user

    except SQLAlchemyError as e:
        print(f"Database Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "Database exception occurred!"
            }
        )
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "message": "An unexpected error occurred!"
            }
        )           


# --- Edit Admin User ---
@userRouter.put("/{user_id}", response_model=UserResponse,dependencies=[Depends(admin_required)])
async def update_admin_user(
    user_id: int, 
    payload: AdminUser, 
    db: AsyncSession = Depends(get_db)
):
    try:
        if payload.admin_secret_key != get_config().admin_secret_key:
            return JSONResponse(
                status_code=403,
                content={
                    "message": "Invalid admin secret key."
                }
            )

        # check if email or mobile already exists for other users
        result = await db.execute(
        select(User).where(User.email == payload.email)
        )
        existing = result.scalar_one_or_none()

        if existing:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Email already exists"
                }
            )


        result = await db.execute(
            select(User).where(User.mobile == payload.mobile)
        )
        existing = result.scalar_one_or_none()

        if existing:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Phone number already exists"
                }
            )

        
        query = select(User).options(selectinload(User.branch)).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user or user.role != UserRole.admin:
            return JSONResponse(
                status_code=404,
                content={"message": "User not found"}
            )


        update_data = payload.model_dump(exclude_unset=True)

       
        for key, value in update_data.items():
            if hasattr(user, key):
                
                setattr(user, key, value)

     
        await db.commit()
        await db.refresh(user, attribute_names=["branch"])
        
        return user

    except SQLAlchemyError as e:
        await db.rollback()

        print(f"DB Error: {e}") 
        return JSONResponse(
            status_code=500,
            content={"message": "Update failed"}
        )

# --- Edit Inventory User ---
@userRouter.put("/{user_id}", response_model=UserResponse, dependencies=[Depends(admin_required)])
async def update_user(
    user_id: int, 
    payload: UserUpdate, 
    db: AsyncSession = Depends(get_db)
):
    try:
        # check if email or mobile already exists for other users
        result = await db.execute(
        select(User).where(User.email == payload.email)
        )
        existing = result.scalar_one_or_none()

        if existing:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Email already exists"
                }
            )


        result = await db.execute(
            select(User).where(User.mobile == payload.mobile)
        )
        existing = result.scalar_one_or_none()

        if existing:
            return JSONResponse(
                status_code=400,
                content={
                    "message": "Phone number already exists"
                }
            )


        query = select(User).options(selectinload(User.branch)).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            return JSONResponse(
                status_code=404,
                content={"message": "User not found"}
            )


        update_data = payload.model_dump(exclude_unset=True)

       
        for key, value in update_data.items():
            if hasattr(user, key):
                
                setattr(user, key, value)

     
        await db.commit()
        await db.refresh(user, attribute_names=["branch"])
        
        return user

    except SQLAlchemyError as e:
        await db.rollback()

        print(f"DB Error: {e}") 
        return JSONResponse(
            status_code=500,
            content={"message": "Update failed"}
        )

# --- delete user ---
@userRouter.delete("/{user_id}", status_code=204, dependencies=[Depends(admin_required)])
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if not user:
            return JSONResponse(
                status_code=404,
                content={"message": "User not found"}
            )

        await db.delete(user)
        await db.commit()

        return JSONResponse(status_code=204, content=None)

    except SQLAlchemyError as e:
        await db.rollback()
        print(f"DB Error: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": "Deletion failed"}
        )