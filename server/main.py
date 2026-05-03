from app.app import app

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app,"localhost",8000)