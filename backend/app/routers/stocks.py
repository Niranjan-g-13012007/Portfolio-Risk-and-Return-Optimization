from fastapi import APIRouter
from app.services.data_service import get_stock_universe

router = APIRouter()


@router.get("/stocks")
def list_stocks():
    """Returns the curated list of stocks available for portfolio selection."""
    return {"stocks": get_stock_universe()}
