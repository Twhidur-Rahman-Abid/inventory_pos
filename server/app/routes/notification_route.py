from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse

# Import utility functions
from app.utils.sse_manager import add_branch_listener, remove_branch_listener

notificationRouter = APIRouter(prefix="/notifications", tags=["Notifications"])


@notificationRouter.get("/stream/{branch_id}")
async def message_stream(branch_id: int, request: Request):
    queue = add_branch_listener(branch_id)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await queue.get()
                yield {"event": "stock_transfer", "data": data}
        finally:
            remove_branch_listener(branch_id, queue)

    return EventSourceResponse(event_generator())