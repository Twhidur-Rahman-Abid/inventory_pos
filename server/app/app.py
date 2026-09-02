from pathlib import Path

from fastapi import FastAPI, APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import text
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import get_config
from app.database.db import get_db
from app.utils.limiter import limiter
from slowapi import  _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.routes.user_route import userRouter
from app.routes.category_route import categoryRouter
from app.routes.auth_route import authRouter
from app.routes.product_route import productRouter
from app.routes.branch_route import branchRouter
from app.routes.order_route import orderRouter
from app.routes.dashboard_route import dashboard_router
from app.routes.stock_route import stockRouter
from app.routes.coupon_route import couponRouter
from app.routes.brand_router import brandRouter
from app.routes.web_route import webRouter
from fastapi.middleware.cors import CORSMiddleware

config = get_config()



app = FastAPI(title=config.app_name, docs_url=config.docs_url)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)



# Configure CORS
origins = config.origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,      
    allow_methods=["*"],         
    allow_headers=["*"],       
)


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
# handle validation error 
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request,exc):
    errors = {}
    for error in exc.errors():
        errors[error['loc'][-1]] = error['msg']

    return JSONResponse({'message':"Validation error!",'errors':errors},status_code=422)


# handle internal server error
@app.exception_handler(Exception)
async def internal_server_error_handler(request, exc):
    return JSONResponse({'message': 'Internal server error occurred!', 'detail': str(exc)}, status_code=500)

@app.get("/health")
async def health_check(response: Response, db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return {"status": "unhealthy", "database": str(e)}
    
v1RRouter = APIRouter(prefix="/api/v1")
v1RRouter.include_router(router=branchRouter)
v1RRouter.include_router(router=userRouter)
v1RRouter.include_router(router=authRouter)
v1RRouter.include_router(router=categoryRouter)
v1RRouter.include_router(router=brandRouter)
v1RRouter.include_router(router=productRouter)
v1RRouter.include_router(router=orderRouter)
v1RRouter.include_router(router=dashboard_router)
v1RRouter.include_router(router=stockRouter)
v1RRouter.include_router(router=couponRouter)
v1RRouter.include_router(router=webRouter)

app.include_router(v1RRouter)

@app.get("/")
def index():
    config = get_config()
    return {"message": f"Welcome to {config.app_name} api"}