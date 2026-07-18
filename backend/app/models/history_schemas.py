"""Pydantic models for portfolio history and comparison."""

from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class SaveHistoryRequest(BaseModel):
    portfolio_name: Optional[str] = None
    investment_amount: float
    stocks: list[str]
    risk_level: str
    investment_period: str
    # Full optimize result fields — saved verbatim so we can replay without re-running
    allocation: list[dict[str, Any]]
    expected_return: float
    portfolio_risk: float
    sharpe_ratio: float
    historical_data: list[dict[str, Any]]   # historical_prices series
    insights: list[str]
    is_simulated_data: bool = False
    efficient_frontier: list[dict[str, Any]] = []
    max_sharpe_point: dict[str, Any] = {}
    min_vol_point: dict[str, Any] = {}
    stock_returns: list[dict[str, Any]] = []
    projected_value: float = 0.0
    projected_profit: float = 0.0
    diversification_score: float = 0.0
    risk_score: float = 0.0
    health_score: float = 0.0


class CompareFromHistoryRequest(BaseModel):
    history_id_a: str
    history_id_b: str


class ManualCompareItem(BaseModel):
    """One portfolio config for the manual compare endpoint."""
    amount: float
    stocks: list[str]
    risk: str
    period: str


class ManualCompareRequest(BaseModel):
    portfolio_a: ManualCompareItem
    portfolio_b: ManualCompareItem
