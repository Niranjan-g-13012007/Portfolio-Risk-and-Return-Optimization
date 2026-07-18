"""
Portfolio Risk & Return Optimization — API entry point.

Run locally with:
    uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import stocks, optimize, report

app = FastAPI(
    title="Portfolio Risk & Return Optimization API",
    description="Modern Portfolio Theory based allocation engine.",
    version="1.0.0",
)

# Allow the Vite dev server (and any origin in dev) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, tags=["Stocks"])
app.include_router(optimize.router, tags=["Optimization"])
app.include_router(report.router, tags=["Reports"])


@app.get("/", tags=["Health"])
def health_check():
    """Simple health check used by the frontend to confirm the API is up."""
    return {"status": "ok", "service": "portfolio-optimizer-api", "version": "1.0.0"}
