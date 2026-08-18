from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.database.schema.user import User, UserRole
from app.utils.auth import decode_token

OAuth2_bearer = OAuth2PasswordBearer(tokenUrl='api/v1/auth/login')

security = Annotated[str, Depends(OAuth2_bearer)]
async def get_current_user(
    token: security,
    db: AsyncSession = Depends(get_db)
):

    try:
        payload = decode_token(token)

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user_id = int(payload.get("sub"))

        result = await db.execute(
            select(User).where(User.id == user_id)
        )

        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )


def role_required(roles: list[UserRole]):

    async def checker(
        current_user: User = Depends(get_current_user)
    ):

        if current_user.role not in roles:
            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        return current_user

    return checker

# admin can access
def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user