from fastapi import APIRouter, HTTPException

from app.models.schemas import OptimizeRequest, OptimizeResponse
from app.services.data_service import fetch_price_history, STOCK_UNIVERSE
from app.services.optimization_service import (
    optimize_portfolio,
    compute_diversification_score,
    compute_risk_score,
    compute_health_score,
)
from app.services.insights_service import generate_insights

router = APIRouter()


@router.post("/optimize", response_model=OptimizeResponse)
def optimize(payload: OptimizeRequest):
    symbols = [s.upper() for s in payload.stocks]

    unknown = [s for s in symbols if s not in STOCK_UNIVERSE]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unsupported symbols: {unknown}")

    if len(symbols) < 2:
        raise HTTPException(status_code=400, detail="Select at least 2 stocks to build a portfolio.")

    prices, is_simulated = fetch_price_history(symbols, payload.period)

    try:
        result = optimize_portfolio(prices, payload.risk)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {exc}")

    weights = result["weights"]
    mean_returns = result["mean_returns"]
    cov = result["cov"]

    diversification_score = compute_diversification_score(weights, cov)
    risk_score = compute_risk_score(result["risk"])
    health_score = compute_health_score(result["sharpe"], diversification_score, risk_score)

    # Build allocation table
    allocation = []
    stock_returns = []
    for i, symbol in enumerate(symbols):
        weight_pct = float(weights[i]) * 100
        invested = payload.amount * (weight_pct / 100)
        stock_expected_return = float(mean_returns[symbol])
        projected_value = invested * (1 + stock_expected_return)
        allocation.append({
            "symbol": symbol,
            "name": STOCK_UNIVERSE[symbol]["name"],
            "weight": round(weight_pct, 2),
            "expected_contribution": round(weight_pct / 100 * stock_expected_return * 100, 2),
            "invested_amount": round(invested, 2),
            "projected_value": round(projected_value, 2),
            "projected_profit": round(projected_value - invested, 2),
        })
        stock_returns.append({
            "symbol": symbol,
            "annual_return": round(stock_expected_return * 100, 2),
            "annual_volatility": round(float(cov.loc[symbol, symbol]) ** 0.5 * 100, 2),
        })

    total_projected_value = payload.amount * (1 + result["expected_return"])
    total_projected_profit = total_projected_value - payload.amount

    # Historical price series for the line chart (downsample for payload size)
    step = max(1, len(prices) // 120)
    sampled = prices.iloc[::step]
    historical_prices = [
        {
            "symbol": symbol,
            "dates": [d.strftime("%Y-%m-%d") for d in sampled.index],
            "prices": [round(float(v), 2) for v in sampled[symbol].values],
        }
        for symbol in symbols
    ]

    insights = generate_insights(
        allocation=allocation,
        expected_return=result["expected_return"],
        risk=result["risk"],
        sharpe=result["sharpe"],
        diversification_score=diversification_score,
        risk_level=payload.risk,
    )

    return {
        "expected_return": round(result["expected_return"] * 100, 2),
        "risk": round(result["risk"] * 100, 2),
        "sharpe": round(result["sharpe"], 2),
        "amount": payload.amount,
        "projected_value": round(total_projected_value, 2),
        "projected_profit": round(total_projected_profit, 2),
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
    }
