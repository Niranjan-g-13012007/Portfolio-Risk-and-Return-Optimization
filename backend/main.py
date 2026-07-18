"""
Portfolio Risk & Return Optimization — API entry point.

Run locally with:
    uvicorn main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import connect, disconnect
from app.routers import stocks, optimize, report, auth, history, compare


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB on startup and disconnect on shutdown."""
    await connect()
    yield
    await disconnect()


app = FastAPI(
    title="Portfolio Risk & Return Optimization API",
    description="Modern Portfolio Theory + Auth + History.",
    version="2.0.0",
    lifespan=lifespan,
)

# Allow the Vite dev server (and Vercel in production) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Existing portfolio routers ────────────────────────────────────────────────
app.include_router(stocks.router, tags=["Stocks"])
app.include_router(optimize.router, tags=["Optimization"])
app.include_router(report.router, tags=["Reports"])

# ── New auth / history / compare routers ─────────────────────────────────────
app.include_router(auth.router, tags=["Auth"])
app.include_router(history.router, tags=["History"])
app.include_router(compare.router, tags=["Compare"])


@app.get("/", tags=["Health"])
def health_check():
    """Simple health check used by the frontend to confirm the API is up."""
    return {"status": "ok", "service": "portfolio-optimizer-api", "version": "2.0.0"}

