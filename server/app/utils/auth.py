from pwdlib import PasswordHash
from jose import jwt 
from datetime import datetime, timedelta, timezone

from app.config import get_config



def hash_password(password:str)->str:
    pwd_context = PasswordHash.recommended()
    return pwd_context.hash(password)

def verify_password(plain_password:str, hashed_password:str)->bool:
    pwd_context = PasswordHash.recommended()
    return pwd_context.verify(plain_password, hashed_password)



config = get_config()





def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=config.access_token_expire_minutes
    )

    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    return jwt.encode(
        to_encode,
        config.secret_key,
        algorithm=config.algorithm
    )


def create_refresh_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        days=config.refresh_token_expire_days
    )

    to_encode.update({
        "exp": expire,
        "type": "refresh"
    })

    return jwt.encode(
        to_encode,
        config.secret_key,
        algorithm=config.algorithm
    )


def decode_token(token: str):

    return jwt.decode(
        token,
        config.secret_key,
        algorithms=config.algorithm 
    )