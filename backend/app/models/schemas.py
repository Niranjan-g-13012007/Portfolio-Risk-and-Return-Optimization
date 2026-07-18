"""Pydantic models shared across routers."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


RiskLevel = Literal["Low", "Lower Medium", "Medium", "Upper Medium", "High"]
Period = Literal["1mo", "6mo", "1y", "3y", "5y", "7y", "10y", "15y"]


class StockInfo(BaseModel):
    symbol: str
    name: str
    sector: str


class OptimizeRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Investment amount in INR")
    stocks: List[str] = Field(..., min_length=2, max_length=10)
    risk: RiskLevel
    period: Period


class AllocationItem(BaseModel):
    symbol: str
    name: str
    weight: float                 # percentage, 0-100
    expected_contribution: float  # percentage points of total expected return
    invested_amount: float
    projected_value: float
    projected_profit: float


class FrontierPoint(BaseModel):
    risk: float
    ret: float


class HistoricalSeries(BaseModel):
    symbol: str
    dates: List[str]
    prices: List[float]


class StockReturn(BaseModel):
    symbol: str
    annual_return: float
    annual_volatility: float


class OptimizeResponse(BaseModel):
    expected_return: float
    risk: float
    sharpe: float
    amount: float
    projected_value: float
    projected_profit: float
    allocation: List[AllocationItem]
    stock_returns: List[StockReturn]
    historical_prices: List[HistoricalSeries]
    efficient_frontier: List[FrontierPoint]
    max_sharpe_point: FrontierPoint
    min_vol_point: FrontierPoint
    diversification_score: float
    risk_score: float
    health_score: float
    insights: List[str]
    is_simulated_data: bool = False
