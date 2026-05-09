from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database.db import get_db
from app.database.schema.user import User
from app.models.user import User as UserModel, UserPaginationResponse, UserResponse
from typing import Optional
from app.utils.auth import hash_password

userRouter = APIRouter(prefix="/users",tags=["Users"])



@userRouter.get("/", response_model=UserPaginationResponse)
async def get_users(
    page: int = 1, 
    limit: int = 10,
    search: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * limit

    # Base queries
    count_query = select(func.count()).select_from(User)
    data_query = select(User)

    # Apply search filter if search value is provided
    if search:
        # Matches if name, email, or mobile starts with the search string
        search_filter = or_(
            User.mobile.startswith(search),
            User.email.startswith(search),
            User.name.startswith(search),
        )
        count_query = count_query.where(search_filter)
        data_query = data_query.where(search_filter)

    # Execute Count
    count_result = await db.execute(count_query)
    total_count = count_result.scalar() or 0

    # Execute Data Fetch
    data_query = data_query.offset(skip).limit(limit)
    result = await db.execute(data_query)
    users = result.scalars().all()

    has_next = total_count > (skip + limit)

    return {
        "total": total_count,
        "page": page,
        "limit": limit,
        "has_next": has_next,
        "users": users
    }

@userRouter.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select().where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@userRouter.post("/",response_model=UserResponse,status_code=201)
async def create_user(payload: UserModel, db: AsyncSession = Depends(get_db)):

    result = await db.execute(
        select(User).where(User.email == payload.email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")


    result = await db.execute(
        select(User).where(User.mobile == payload.mobile)
    )
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(status_code=400, detail="Phone number already exists")

    hashed = hash_password(payload.password)
    print("Hashed Password:", hashed)
    user = User(name=payload.name, 
    email=payload.email, 
    mobile=payload.mobile, 
    password=hashed, 
    role=payload.role)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user