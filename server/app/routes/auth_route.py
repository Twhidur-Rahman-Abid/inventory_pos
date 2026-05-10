from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.database.schema.user import User, UserRole

from app.models.user import RegisterSchema, LoginSchema, ResetPasswordSchema, RefreshTokenSchema


from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)



from app.utils.dependencies import (
    get_current_user,
    role_required
)

authRouter = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# REGISTER
@authRouter.post("/register")
async def register(
    data: RegisterSchema,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(User).where(User.email == data.email)
    )

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    user = User(
        name=data.name,
        email=data.email,
        mobile=data.mobile,
        password=hash_password(data.password),
        role=data.role
    )

    db.add(user)

    await db.commit()
    await db.refresh(user)

    access_token = create_access_token({
        "sub": str(user.id),
        "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role.value
        }
    })

    refresh_token = create_refresh_token({
        "sub": str(user.id)
    })

    return {
        "user": user,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# LOGIN
@authRouter.post("/login")
async def login(
    data: LoginSchema,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(User).where(User.email == data.email)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    is_valid = verify_password(
        data.password,
        user.password
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials"
        )

    access_token = create_access_token({
        "sub": str(user.id),
         "user": {
            "name": user.name,
            "email": user.email,
            "role": user.role.value
        }
    })

    refresh_token = create_refresh_token({
        "sub": str(user.id)
    })

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# REFRESH TOKEN
@authRouter.post("/refresh")
async def refresh_token(
    data: RefreshTokenSchema
):

    payload = decode_token(
        data.refresh_token
    )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    user_id = payload.get("sub")
    user = payload.get("user")

    new_access_token = create_access_token({
        "sub": str(user_id),
        "user":user
    })

    new_refresh_token = create_refresh_token({
        "sub": str(user_id)
    })

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }


# RESET PASSWORD
@authRouter.post("/reset-password",dependencies=[Depends(get_current_user)])
async def reset_password(
    data: ResetPasswordSchema,
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(
        select(User).where(User.email == data.email)
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    is_valid = verify_password(
        data.old_password,
        user.password
    )

    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail="Old password incorrect"
        )

    user.password = hash_password(
        data.new_password
    )

    await db.commit()

    return {
        "message": "Password updated successfully"
    }


# PROTECTED ROUTE
@authRouter.get("/me")
async def me(
    current_user: User = Depends(get_current_user)
):

    return current_user


# ADMIN ONLY
@authRouter.get("/admin")
async def admin_route(
    current_user: User = Depends(
        role_required([
            UserRole.admin
        ])
    )
):

    return {
        "message": "Admin route"
    }


# ADMIN + MANAGER
@authRouter.get("/manager")
async def manager_route(
    current_user: User = Depends(
        role_required([
            UserRole.admin,
            UserRole.warehouse_manager
        ])
    )
):

    return {
        "message": "Manager route"
    }