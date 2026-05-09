import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Ekhane apnar database connection string thikmoto bhashan
# Example: postgresql+asyncpg://postgres:password@localhost:5432/your_db_name
DATABASE_URL = "postgresql+asyncpg://postgres:admin@localhost/inventory" 

async def kill_alembic_history():
    try:
        engine = create_async_engine(DATABASE_URL)
        async with engine.begin() as conn:
            # Purono alembic history table drop kora
            await conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            print("\n✅ Success: 'alembic_version' table has been deleted!")
            print("Now you can run alembic commands safely.\n")
    except Exception as e:
        print(f"\n❌ Error: {e}\n")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(kill_alembic_history())