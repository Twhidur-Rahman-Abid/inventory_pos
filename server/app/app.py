from fastapi import FastAPI,APIRouter
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import get_config
from app.routes.user_route import userRouter
from app.routes.category_route import categoryRouter
from app.routes.auth_route import authRouter
from app.routes.product_route import productRouter
from app.routes.branch_route import branchRouter
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=get_config().app_name)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",  
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       
    allow_credentials=True,      
    allow_methods=["*"],         
    allow_headers=["*"],       
)


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

v1RRouter = APIRouter(prefix="/api/v1")
v1RRouter.include_router(router=branchRouter)
v1RRouter.include_router(router=userRouter)
v1RRouter.include_router(router=authRouter)
v1RRouter.include_router(router=categoryRouter)
v1RRouter.include_router(router=productRouter)

app.include_router(v1RRouter)

@app.get("/")
def index():
    config = get_config()
    return {"message": f"Welcome to {config.app_name} api"}