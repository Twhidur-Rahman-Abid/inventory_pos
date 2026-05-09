from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from app.config import get_config
from app.routes.user_route import userRouter
from app.routes.category_route import categoryRouter
from app.routes.auth_route import authRouter

app = FastAPI()


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

app.include_router(router=userRouter,prefix="/api/v1")
app.include_router(router=categoryRouter,prefix="/api/v1")
app.include_router(router=authRouter,prefix="/api/v1")

@app.get("/")
def index():
    config = get_config()
    return {"message": f"Welcome to {config.app_name} api"}