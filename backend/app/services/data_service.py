"""
Handles historical price retrieval.

Uses yfinance for real market data. If the network call fails for any
reason (offline demo, rate limiting, firewalled environment such as a
hackathon venue's Wi-Fi), it transparently falls back to a seeded
synthetic price series so the rest of the product keeps working. The
response tells the frontend when simulated data was used
(`is_simulated_data`) so nothing is presented as real without disclosure.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import yfinance as yf

PERIOD_TO_DAYS = {
    "1mo": 30,
    "6mo": 182,
    "1y": 365,
    "3y": 365 * 3,
}

# A small, curated universe of well-known tickers for the hackathon demo.
STOCK_UNIVERSE = {
    "AAPL": {"name": "Apple Inc.", "sector": "Technology"},
    "MSFT": {"name": "Microsoft Corp.", "sector": "Technology"},
    "AMZN": {"name": "Amazon.com Inc.", "sector": "Consumer Discretionary"},
    "GOOGL": {"name": "Alphabet Inc.", "sector": "Communication Services"},
    "TSLA": {"name": "Tesla Inc.", "sector": "Consumer Discretionary"},
    "META": {"name": "Meta Platforms Inc.", "sector": "Communication Services"},
    "NVDA": {"name": "NVIDIA Corp.", "sector": "Technology"},
    "NFLX": {"name": "Netflix Inc.", "sector": "Communication Services"},
    "AMD": {"name": "Advanced Micro Devices", "sector": "Technology"},
    "INTC": {"name": "Intel Corp.", "sector": "Technology"},
}

# Rough per-ticker drift/volatility used only to seed the synthetic fallback
# so the offline demo still looks plausible and internally consistent.
_SYNTHETIC_PARAMS = {
    "AAPL": (0.14, 0.24), "MSFT": (0.16, 0.22), "AMZN": (0.15, 0.30),
    "GOOGL": (0.13, 0.26), "TSLA": (0.20, 0.55), "META": (0.18, 0.34),
    "NVDA": (0.35, 0.45), "NFLX": (0.17, 0.36), "AMD": (0.22, 0.48),
    "INTC": (0.05, 0.32),
}


def get_stock_universe() -> list[dict]:
    return [
        {"symbol": sym, "name": info["name"], "sector": info["sector"]}
        for sym, info in STOCK_UNIVERSE.items()
    ]


def _generate_synthetic_prices(symbols: list[str], days: int) -> pd.DataFrame:
    """Geometric Brownian motion fallback so the app never hard-fails."""
    dates = pd.bdate_range(end=pd.Timestamp.today(), periods=days)
    data = {}
    for sym in symbols:
        drift, vol = _SYNTHETIC_PARAMS.get(sym, (0.12, 0.30))
        rng = np.random.default_rng(abs(hash(sym)) % (2**32))
        daily_drift = drift / 252
        daily_vol = vol / np.sqrt(252)
        shocks = rng.normal(daily_drift, daily_vol, size=len(dates))
        price_path = 100 * np.exp(np.cumsum(shocks))
        data[sym] = price_path
    return pd.DataFrame(data, index=dates)


def fetch_price_history(symbols: list[str], period: str) -> tuple[pd.DataFrame, bool]:
    """
    Returns (adjusted_close_dataframe, is_simulated).

    Tries yfinance first; on any failure (no internet, bad ticker, empty
    response) falls back to synthetic data so the demo never crashes.
    """
    days = PERIOD_TO_DAYS.get(period, 365)
    try:
        raw = yf.download(
            tickers=symbols,
            period=period,
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=True,
        )
        if raw is None or raw.empty:
            raise ValueError("Empty response from Yahoo Finance")

        if len(symbols) == 1:
            prices = raw[["Close"]].rename(columns={"Close": symbols[0]})
        else:
            prices = raw["Close"]

        prices = prices.dropna(how="all").ffill().dropna()
        if prices.empty or prices.shape[0] < 10:
            raise ValueError("Insufficient price history returned")

        # Guard against a ticker coming back all-NaN (delisted/typo).
        missing = [s for s in symbols if s not in prices.columns or prices[s].isna().all()]
        if missing:
            raise ValueError(f"No data for: {missing}")

        return prices[symbols], False

    except Exception:
        return _generate_synthetic_prices(symbols, days), True
