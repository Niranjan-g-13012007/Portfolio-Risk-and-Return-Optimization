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
    "5y": 365 * 5,
    "7y": 365 * 7,
    "10y": 365 * 10,
    "15y": 365 * 15,
}

# ─── Full stock universe ──────────────────────────────────────────────────────
STOCK_UNIVERSE = {
    # ── US Stocks ──────────────────────────────────────────────────────────────
    "AAPL":  {"name": "Apple Inc.",               "sector": "Technology",               "market": "US"},
    "MSFT":  {"name": "Microsoft Corp.",           "sector": "Technology",               "market": "US"},
    "AMZN":  {"name": "Amazon.com Inc.",           "sector": "Consumer Discretionary",   "market": "US"},
    "GOOGL": {"name": "Alphabet Inc.",             "sector": "Communication Services",   "market": "US"},
    "TSLA":  {"name": "Tesla Inc.",                "sector": "Consumer Discretionary",   "market": "US"},
    "META":  {"name": "Meta Platforms Inc.",       "sector": "Communication Services",   "market": "US"},
    "NVDA":  {"name": "NVIDIA Corp.",              "sector": "Technology",               "market": "US"},
    "NFLX":  {"name": "Netflix Inc.",              "sector": "Communication Services",   "market": "US"},
    "AMD":   {"name": "Advanced Micro Devices",    "sector": "Technology",               "market": "US"},
    "INTC":  {"name": "Intel Corp.",               "sector": "Technology",               "market": "US"},
    "NKE":   {"name": "Nike Inc.",                 "sector": "Consumer Discretionary",   "market": "US"},
    "MCD":   {"name": "McDonald's Corp.",          "sector": "Consumer Discretionary",   "market": "US"},
    "SBUX":  {"name": "Starbucks Corp.",           "sector": "Consumer Discretionary",   "market": "US"},
    "KO":    {"name": "Coca-Cola Co.",             "sector": "Consumer Staples",         "market": "US"},
    "PEP":   {"name": "PepsiCo Inc.",              "sector": "Consumer Staples",         "market": "US"},
    "WMT":   {"name": "Walmart Inc.",              "sector": "Consumer Staples",         "market": "US"},
    "COST":  {"name": "Costco Wholesale Corp.",    "sector": "Consumer Staples",         "market": "US"},
    "DIS":   {"name": "Walt Disney Co.",           "sector": "Communication Services",   "market": "US"},
    "ABNB":  {"name": "Airbnb Inc.",               "sector": "Consumer Discretionary",   "market": "US"},
    "UBER":  {"name": "Uber Technologies Inc.",    "sector": "Industrials",              "market": "US"},
    "PYPL":  {"name": "PayPal Holdings Inc.",      "sector": "Financials",               "market": "US"},
    "V":     {"name": "Visa Inc.",                 "sector": "Financials",               "market": "US"},
    "MA":    {"name": "Mastercard Inc.",           "sector": "Financials",               "market": "US"},
    # ── Indian Stocks (NSE) ────────────────────────────────────────────────────
    "RELIANCE.NS":   {"name": "Reliance Industries",      "sector": "Energy",               "market": "IN"},
    "TCS.NS":        {"name": "Tata Consultancy Services","sector": "Technology",           "market": "IN"},
    "INFY.NS":       {"name": "Infosys Ltd.",              "sector": "Technology",           "market": "IN"},
    "HDFCBANK.NS":   {"name": "HDFC Bank Ltd.",            "sector": "Financials",           "market": "IN"},
    "ICICIBANK.NS":  {"name": "ICICI Bank Ltd.",           "sector": "Financials",           "market": "IN"},
    "BHARTIARTL.NS": {"name": "Bharti Airtel Ltd.",        "sector": "Communication Services","market": "IN"},
    "SBIN.NS":       {"name": "State Bank of India",       "sector": "Financials",           "market": "IN"},
    "HINDUNILVR.NS": {"name": "Hindustan Unilever Ltd.",   "sector": "Consumer Staples",     "market": "IN"},
    "ITC.NS":        {"name": "ITC Ltd.",                  "sector": "Consumer Staples",     "market": "IN"},
    "TATASTEEL.NS":  {"name": "Tata Steel Ltd.",           "sector": "Materials",            "market": "IN"},
    "LTIM.NS":       {"name": "LTIMindtree Ltd.",          "sector": "Technology",           "market": "IN"},
    "MARUTI.NS":     {"name": "Maruti Suzuki India Ltd.",  "sector": "Consumer Discretionary","market": "IN"},
    # ── Global Stocks ─────────────────────────────────────────────────────────
    "005930.KS": {"name": "Samsung Electronics",   "sector": "Technology",               "market": "GLOBAL"},
    "006400.KS": {"name": "Samsung SDI Co.",       "sector": "Energy",                   "market": "GLOBAL"},
    "6758.T":    {"name": "Sony Group Corp.",       "sector": "Consumer Discretionary",   "market": "GLOBAL"},
    "TM":        {"name": "Toyota Motor Corp.",     "sector": "Consumer Discretionary",   "market": "GLOBAL"},
    "HMC":       {"name": "Honda Motor Co.",        "sector": "Consumer Discretionary",   "market": "GLOBAL"},
    "005380.KS": {"name": "Hyundai Motor Co.",      "sector": "Consumer Discretionary",   "market": "GLOBAL"},
}

# Rough per-ticker drift/volatility used only to seed the synthetic fallback
# so the offline demo still looks plausible and internally consistent.
_SYNTHETIC_PARAMS: dict[str, tuple[float, float]] = {
    # US
    "AAPL": (0.14, 0.24), "MSFT": (0.16, 0.22), "AMZN": (0.15, 0.30),
    "GOOGL": (0.13, 0.26), "TSLA": (0.20, 0.55), "META": (0.18, 0.34),
    "NVDA": (0.35, 0.45), "NFLX": (0.17, 0.36), "AMD": (0.22, 0.48),
    "INTC": (0.05, 0.32), "NKE": (0.10, 0.22), "MCD": (0.09, 0.18),
    "SBUX": (0.08, 0.20), "KO": (0.07, 0.15), "PEP": (0.08, 0.15),
    "WMT": (0.10, 0.16), "COST": (0.14, 0.19), "DIS": (0.08, 0.25),
    "ABNB": (0.12, 0.45), "UBER": (0.18, 0.42), "PYPL": (0.06, 0.38),
    "V": (0.13, 0.18), "MA": (0.14, 0.19),
    # Indian NSE
    "RELIANCE.NS": (0.12, 0.24), "TCS.NS": (0.13, 0.22),
    "INFY.NS": (0.11, 0.24), "HDFCBANK.NS": (0.12, 0.22),
    "ICICIBANK.NS": (0.14, 0.26), "BHARTIARTL.NS": (0.13, 0.28),
    "SBIN.NS": (0.13, 0.30), "HINDUNILVR.NS": (0.10, 0.18),
    "ITC.NS": (0.09, 0.20), "TATASTEEL.NS": (0.15, 0.38),
    "LTIM.NS": (0.14, 0.28), "MARUTI.NS": (0.12, 0.26),
    # Global
    "005930.KS": (0.10, 0.28), "006400.KS": (0.12, 0.32),
    "6758.T": (0.09, 0.24), "TM": (0.08, 0.20),
    "HMC": (0.07, 0.22), "005380.KS": (0.10, 0.28),
}


def get_stock_universe() -> list[dict]:
    return [
        {
            "symbol": sym,
            "name": info["name"],
            "sector": info["sector"],
            "market": info["market"],
        }
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
