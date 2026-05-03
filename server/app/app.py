from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
app = FastAPI()

# handle validation error 
@app.exception_handler(RequestValidationError)
async def validation_error_handler(request,exc):
    errors = {}
    for error in exc.errors():
        errors[error['loc'][-1]] = error['msg']

    return JSONResponse({'message':"Validation error!",'errors':errors},status_code=400)


# handle internal server error
@app.exception_handler(Exception)
async def internal_server_error_handler(request, exc):
    return JSONResponse({'message': 'Internal server error', 'detail': str(exc)}, status_code=500)

@app.get("/")
def index():
    return {"message": "fastapi index"}