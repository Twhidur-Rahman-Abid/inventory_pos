import asyncio
import json
from typing import Dict, Any

# Active listeners dictionary mapped by branch_id
branch_listeners: Dict[int, list[asyncio.Queue]] = {}


async def notify_branch(branch_id: int, message: Dict[str, Any]):
    """
    Pushes real-time notification to all connected browser sessions for a specific branch.
    """
    if branch_id in branch_listeners:
        # Convert dict to JSON string for SSE format safety
        formatted_message = json.dumps(message) if isinstance(message, dict) else message
        
        for queue in branch_listeners[branch_id]:
            await queue.put(formatted_message)


def add_branch_listener(branch_id: int) -> asyncio.Queue:
    """
    Registers a new listener queue for a given branch.
    """
    queue = asyncio.Queue()
    if branch_id not in branch_listeners:
        branch_listeners[branch_id] = []
    branch_listeners[branch_id].append(queue)
    return queue


def remove_branch_listener(branch_id: int, queue: asyncio.Queue):
    """
    Cleans up a listener queue when the connection closes.
    """
    if branch_id in branch_listeners and queue in branch_listeners[branch_id]:
        branch_listeners[branch_id].remove(queue)
        if not branch_listeners[branch_id]:
            del branch_listeners[branch_id]