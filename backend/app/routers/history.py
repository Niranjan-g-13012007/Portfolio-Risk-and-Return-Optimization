"""Portfolio history router — save, list, get, delete."""

from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import get_database
from app.core.deps import get_current_user
from app.models.history_schemas import SaveHistoryRequest

router = APIRouter()


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    # Convert datetime fields to ISO strings
    for key in ("created_at", "updated_at"):
        if isinstance(doc.get(key), datetime):
            doc[key] = doc[key].isoformat()
    return doc


@router.post("/history/save")
async def save_history(
    body: SaveHistoryRequest,
    current_user: dict = Depends(get_current_user),
):
    """Persist a complete portfolio analysis result to the user's history."""
    db = get_database()
    now = datetime.now(timezone.utc)
    portfolio_name = (body.portfolio_name or f"Portfolio — {now.strftime('%b %d, %Y')}").strip()

    doc = {
        "user_id": str(current_user["_id"]),
        "portfolio_name": portfolio_name,
        "investment_amount": body.investment_amount,
        "stocks": body.stocks,
        "risk_level": body.risk_level,
        "investment_period": body.investment_period,
        "allocation": body.allocation,
        "expected_return": body.expected_return,
        "portfolio_risk": body.portfolio_risk,
        "sharpe_ratio": body.sharpe_ratio,
        "historical_data": body.historical_data,
        "insights": body.insights,
        "is_simulated_data": body.is_simulated_data,
        "efficient_frontier": body.efficient_frontier,
        "max_sharpe_point": body.max_sharpe_point,
        "min_vol_point": body.min_vol_point,
        "stock_returns": body.stock_returns,
        "projected_value": body.projected_value,
        "projected_profit": body.projected_profit,
        "diversification_score": body.diversification_score,
        "risk_score": body.risk_score,
        "health_score": body.health_score,
        "created_at": now,
        "updated_at": now,
    }
    result = await db.portfolio_history.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Portfolio saved successfully"}


@router.get("/history")
async def list_history(current_user: dict = Depends(get_current_user)):
    """Return all saved portfolios for the authenticated user, newest first."""
    db = get_database()
    cursor = db.portfolio_history.find(
        {"user_id": str(current_user["_id"])},
        sort=[("created_at", -1)],
    )
    items = [_serialize(doc) async for doc in cursor]
    return {"history": items}


@router.get("/history/{history_id}")
async def get_history_item(
    history_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Fetch a single saved portfolio by ID."""
    db = get_database()
    try:
        oid = ObjectId(history_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid portfolio ID")

    doc = await db.portfolio_history.find_one(
        {"_id": oid, "user_id": str(current_user["_id"])}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return _serialize(doc)


@router.delete("/history/{history_id}")
async def delete_history_item(
    history_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a saved portfolio permanently."""
    db = get_database()
    try:
        oid = ObjectId(history_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid portfolio ID")

    result = await db.portfolio_history.delete_one(
        {"_id": oid, "user_id": str(current_user["_id"])}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Portfolio not found or already deleted")
    return {"message": "Portfolio deleted successfully"}
