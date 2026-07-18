"""Async MongoDB client using Motor."""

from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import MONGODB_URI

_client: AsyncIOMotorClient | None = None


def get_database() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("MongoDB not connected. Ensure lifespan startup ran.")
    return _client["optivest"]


async def connect() -> None:
    global _client
    if not MONGODB_URI:
        raise RuntimeError(
            "MONGODB_URI environment variable is not set. "
            "Create backend/.env from backend/.env.example."
        )
    _client = AsyncIOMotorClient(MONGODB_URI)
    db = get_database()
    # Enforce unique indexes — idempotent (safe to call multiple times)
    await db.users.create_index("email", unique=True)
    await db.users.create_index("phone", unique=True)
    await db.portfolio_history.create_index("user_id")
    print("* MongoDB Atlas connected")


async def disconnect() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
        print("* MongoDB disconnected")
