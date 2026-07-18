"""Portfolio comparison router."""

from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.core.database import get_database
from app.core.deps import get_current_user
from app.models.history_schemas import CompareFromHistoryRequest, ManualCompareRequest
from app.services.data_service import STOCK_UNIVERSE, fetch_price_history
from app.services.insights_service import generate_insights
from app.services.optimization_service import (
    compute_diversification_score,
    compute_health_score,
    compute_risk_score,
    optimize_portfolio,
)

router = APIRouter()


def _serialize_history(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    for key in ("created_at", "updated_at"):
        if isinstance(doc.get(key), datetime):
            doc[key] = doc[key].isoformat()
    return doc


def _run_optimization(item) -> dict:
    """Run full MPT pipeline for a ManualCompareItem. Runs synchronously (thread pool)."""
    symbols = [s.upper() for s in item.stocks]

    unknown = [s for s in symbols if s not in STOCK_UNIVERSE]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unsupported symbols: {unknown}")
    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 stocks")

    prices, is_simulated = fetch_price_history(symbols, item.period)
    result = optimize_portfolio(prices, item.risk)

    weights = result["weights"]
    mean_returns = result["mean_returns"]
    cov = result["cov"]

    diversification_score = compute_diversification_score(weights, cov)
    risk_score = compute_risk_score(result["risk"])
    health_score = compute_health_score(result["sharpe"], diversification_score, risk_score)

    allocation = []
    stock_returns = []
    for i, symbol in enumerate(symbols):
        w_pct = float(weights[i]) * 100
        invested = item.amount * (w_pct / 100)
        ret = float(mean_returns[symbol])
        projected = invested * (1 + ret)
        allocation.append({
            "symbol": symbol,
            "name": STOCK_UNIVERSE[symbol]["name"],
            "weight": round(w_pct, 2),
            "expected_contribution": round(w_pct / 100 * ret * 100, 2),
            "invested_amount": round(invested, 2),
            "projected_value": round(projected, 2),
            "projected_profit": round(projected - invested, 2),
        })
        stock_returns.append({
            "symbol": symbol,
            "annual_return": round(ret * 100, 2),
            "annual_volatility": round(float(cov.loc[symbol, symbol]) ** 0.5 * 100, 2),
        })

    total_projected = item.amount * (1 + result["expected_return"])
    step = max(1, len(prices) // 120)
    sampled = prices.iloc[::step]
    historical_prices = [
        {
            "symbol": sym,
            "dates": [d.strftime("%Y-%m-%d") for d in sampled.index],
            "prices": [round(float(v), 2) for v in sampled[sym].values],
        }
        for sym in symbols
    ]

    insights = generate_insights(
        allocation=allocation,
        expected_return=result["expected_return"],
        risk=result["risk"],
        sharpe=result["sharpe"],
        diversification_score=diversification_score,
        risk_level=item.risk,
    )

    return {
        "expected_return": round(result["expected_return"] * 100, 2),
        "risk": round(result["risk"] * 100, 2),
        "sharpe": round(result["sharpe"], 2),
        "amount": item.amount,
        "projected_value": round(total_projected, 2),
        "projected_profit": round(total_projected - item.amount, 2),
        "allocation": allocation,
        "stock_returns": stock_returns,
        "historical_prices": historical_prices,
        "efficient_frontier": result["efficient_frontier"],
        "max_sharpe_point": result["max_sharpe_point"],
        "min_vol_point": result["min_vol_point"],
        "diversification_score": diversification_score,
        "risk_score": risk_score,
        "health_score": health_score,
        "insights": insights,
        "is_simulated_data": is_simulated,
        "stocks": symbols,
        "risk_level": item.risk,
        "investment_period": item.period,
    }


@router.post("/compare/history")
async def compare_from_history(
    body: CompareFromHistoryRequest,
    current_user: dict = Depends(get_current_user),
):
    """Return two saved portfolios side by side for comparison."""
    db = get_database()
    portfolios = []
    for hid in (body.history_id_a, body.history_id_b):
        try:
            oid = ObjectId(hid)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid portfolio ID: {hid}")

        doc = await db.portfolio_history.find_one(
            {"_id": oid, "user_id": str(current_user["_id"])}
        )
        if not doc:
            raise HTTPException(status_code=404, detail=f"Portfolio {hid} not found")
        portfolios.append(_serialize_history(doc))

    return {"portfolio_a": portfolios[0], "portfolio_b": portfolios[1]}


@router.post("/compare/manual")
def compare_manual(body: ManualCompareRequest):
    """Run two independent optimizations and return both results for comparison."""
    result_a = _run_optimization(body.portfolio_a)
    result_b = _run_optimization(body.portfolio_b)
    return {"portfolio_a": result_a, "portfolio_b": result_b}
