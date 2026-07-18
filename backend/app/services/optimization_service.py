"""
Modern Portfolio Theory engine.

Implements:
  - Daily & annualized returns
  - Covariance matrix / annualized volatility
  - Monte Carlo simulation (10,000 random portfolios) for the efficient
    frontier scatter
  - scipy.optimize based search for the Maximum Sharpe Ratio portfolio
    and the Minimum Volatility portfolio
  - A risk-level -> target-volatility mapping so "Low / Medium / High"
    selects a point along the efficient frontier rather than always
    returning the same portfolio
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.optimize import minimize

RISK_FREE_RATE = 0.065  # approx. Indian 10y G-Sec yield, used for Sharpe ratio
TRADING_DAYS = 252
N_SIMULATIONS = 10_000

RISK_TARGET_PERCENTILE = {
    "Low": 0.10,          # minimum-volatility end of the frontier
    "Lower Medium": 0.30, # slightly conservative
    "Medium": 0.50,       # balanced
    "Upper Medium": 0.70, # slightly aggressive
    "High": 0.90,         # maximum-return end of the frontier
}


def compute_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """Daily simple returns."""
    return prices.pct_change().dropna()


def annualize_returns(daily_returns: pd.DataFrame) -> pd.Series:
    return daily_returns.mean() * TRADING_DAYS


def annualize_covariance(daily_returns: pd.DataFrame) -> pd.DataFrame:
    return daily_returns.cov() * TRADING_DAYS


def _portfolio_performance(weights: np.ndarray, mean_returns: pd.Series, cov: pd.DataFrame):
    ret = float(np.dot(weights, mean_returns))
    vol = float(np.sqrt(np.dot(weights.T, np.dot(cov, weights))))
    sharpe = (ret - RISK_FREE_RATE) / vol if vol > 0 else 0.0
    return ret, vol, sharpe


def _neg_sharpe(weights, mean_returns, cov):
    _, _, sharpe = _portfolio_performance(weights, mean_returns, cov)
    return -sharpe


def _volatility(weights, mean_returns, cov):
    _, vol, _ = _portfolio_performance(weights, mean_returns, cov)
    return vol


def _min_vol_for_target_return(target_return, mean_returns, cov, bounds, n):
    constraints = (
        {"type": "eq", "fun": lambda w: np.sum(w) - 1},
        {"type": "eq", "fun": lambda w: np.dot(w, mean_returns) - target_return},
    )
    init = np.repeat(1 / n, n)
    result = minimize(
        _volatility, init, args=(mean_returns, cov),
        method="SLSQP", bounds=bounds, constraints=constraints,
    )
    return result


def run_monte_carlo(mean_returns: pd.Series, cov: pd.DataFrame, n_assets: int, n_sims: int = N_SIMULATIONS):
    """Random-weight simulation used to draw the efficient frontier scatter."""
    rng = np.random.default_rng(42)
    results = np.zeros((n_sims, 3))  # ret, vol, sharpe
    for i in range(n_sims):
        w = rng.random(n_assets)
        w /= w.sum()
        ret, vol, sharpe = _portfolio_performance(w, mean_returns, cov)
        results[i] = [ret, vol, sharpe]
    return results


def optimize_portfolio(prices: pd.DataFrame, risk_level: str) -> dict:
    """
    Full MPT pipeline. Returns a dict with everything the API response needs:
    weights for the selected risk level, the max-sharpe and min-vol portfolios,
    per-asset stats, and the efficient frontier sample for charting.
    """
    symbols = list(prices.columns)
    n = len(symbols)

    daily_returns = compute_returns(prices)
    mean_returns = annualize_returns(daily_returns)
    cov = annualize_covariance(daily_returns)

    bounds = tuple((0.0, 1.0) for _ in range(n))
    init_guess = np.repeat(1 / n, n)
    constraints = ({"type": "eq", "fun": lambda w: np.sum(w) - 1},)

    # --- Maximum Sharpe Ratio portfolio ---
    max_sharpe_res = minimize(
        _neg_sharpe, init_guess, args=(mean_returns, cov),
        method="SLSQP", bounds=bounds, constraints=constraints,
    )
    max_sharpe_weights = max_sharpe_res.x if max_sharpe_res.success else init_guess

    # --- Minimum Volatility portfolio ---
    min_vol_res = minimize(
        _volatility, init_guess, args=(mean_returns, cov),
        method="SLSQP", bounds=bounds, constraints=constraints,
    )
    min_vol_weights = min_vol_res.x if min_vol_res.success else init_guess

    max_sharpe_perf = _portfolio_performance(max_sharpe_weights, mean_returns, cov)
    min_vol_perf = _portfolio_performance(min_vol_weights, mean_returns, cov)

    # --- Efficient frontier: sweep target returns between min-vol and max-return asset ---
    lowest_ret = min_vol_perf[0]
    highest_ret = float(mean_returns.max())
    target_returns = np.linspace(lowest_ret, highest_ret, 40)
    frontier_points = []
    frontier_weight_by_target = {}
    for tr in target_returns:
        res = _min_vol_for_target_return(tr, mean_returns, cov, bounds, n)
        if res.success:
            vol = _volatility(res.x, mean_returns, cov)
            frontier_points.append({"risk": round(vol * 100, 3), "ret": round(tr * 100, 3)})
            frontier_weight_by_target[round(tr, 6)] = res.x

    # --- Pick a portfolio along the frontier based on user's risk preference ---
    percentile = RISK_TARGET_PERCENTILE.get(risk_level, 0.5)
    target_return = lowest_ret + percentile * (highest_ret - lowest_ret)
    selected_res = _min_vol_for_target_return(target_return, mean_returns, cov, bounds, n)
    if selected_res.success:
        selected_weights = selected_res.x
    else:
        # Fall back: blend min-vol and max-sharpe by the same percentile
        selected_weights = (1 - percentile) * min_vol_weights + percentile * max_sharpe_weights
        selected_weights /= selected_weights.sum()

    selected_perf = _portfolio_performance(selected_weights, mean_returns, cov)

    # --- Monte Carlo cloud for the scatter chart ---
    mc_results = run_monte_carlo(mean_returns, cov, n)
    mc_sample = mc_results[np.random.default_rng(1).choice(len(mc_results), size=500, replace=False)]
    frontier_scatter = [
        {"risk": round(float(r[1]) * 100, 3), "ret": round(float(r[0]) * 100, 3)}
        for r in mc_sample
    ]
    # Combine Monte Carlo cloud with the true optimized frontier curve so the
    # chart shows both the random cloud and the efficient edge.
    all_frontier_points = frontier_scatter + frontier_points

    return {
        "symbols": symbols,
        "weights": selected_weights,
        "expected_return": selected_perf[0],
        "risk": selected_perf[1],
        "sharpe": selected_perf[2],
        "mean_returns": mean_returns,
        "cov": cov,
        "max_sharpe_point": {"risk": round(max_sharpe_perf[1] * 100, 3), "ret": round(max_sharpe_perf[0] * 100, 3)},
        "min_vol_point": {"risk": round(min_vol_perf[1] * 100, 3), "ret": round(min_vol_perf[0] * 100, 3)},
        "efficient_frontier": all_frontier_points,
    }


def compute_diversification_score(weights: np.ndarray, cov: pd.DataFrame) -> float:
    """
    Herfindahl-based diversification score, 0-100.
    Perfectly equal weights across n assets -> 100. Fully concentrated -> 0.
    """
    n = len(weights)
    hhi = float(np.sum(weights ** 2))
    min_hhi = 1 / n
    # Normalize so equal-weight (hhi == min_hhi) maps to 100 and
    # fully concentrated (hhi == 1) maps to 0.
    score = (1 - hhi) / (1 - min_hhi) * 100 if n > 1 else 0.0
    return round(max(0.0, min(100.0, score)), 1)


def compute_risk_score(volatility: float) -> float:
    """Maps annualized volatility to a 0-100 risk score (higher = riskier)."""
    # 5% vol -> ~5 score, 60%+ vol -> ~100 score (roughly linear, capped)
    score = (volatility / 0.60) * 100
    return round(max(0.0, min(100.0, score)), 1)


def compute_health_score(sharpe: float, diversification: float, risk_score: float) -> float:
    """
    Blended 0-100 "portfolio health" score:
      - Reward risk-adjusted return (Sharpe)
      - Reward diversification
      - Penalize excessive risk gently
    """
    sharpe_component = max(0.0, min(1.0, sharpe / 2.5)) * 50   # up to 50 pts
    diversification_component = (diversification / 100) * 35   # up to 35 pts
    risk_penalty = max(0.0, (risk_score - 70) / 100) * 15       # penalty above 70 risk score
    score = sharpe_component + diversification_component - risk_penalty + 15  # base 15 pts
    return round(max(0.0, min(100.0, score)), 1)
