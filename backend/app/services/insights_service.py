"""Rule-based natural-language insight generation for the results dashboard."""

from __future__ import annotations

from app.services.data_service import STOCK_UNIVERSE


def generate_insights(
    allocation: list[dict],
    expected_return: float,
    risk: float,
    sharpe: float,
    diversification_score: float,
    risk_level: str,
) -> list[str]:
    insights: list[str] = []

    # Diversification
    if diversification_score >= 70:
        insights.append("This portfolio is well diversified across the selected holdings.")
    elif diversification_score >= 40:
        insights.append("This portfolio has moderate diversification, with some concentration in top holdings.")
    else:
        top = max(allocation, key=lambda a: a["weight"])
        insights.append(f"This portfolio is concentrated, with {top['symbol']} making up {top['weight']:.1f}% of the allocation.")

    # Sector concentration
    sectors: dict[str, float] = {}
    for item in allocation:
        sector = STOCK_UNIVERSE.get(item["symbol"], {}).get("sector", "Other")
        sectors[sector] = sectors.get(sector, 0) + item["weight"]
    dominant_sector, dominant_weight = max(sectors.items(), key=lambda kv: kv[1])
    if dominant_weight >= 50:
        insights.append(f"{dominant_sector} dominates the portfolio at {dominant_weight:.1f}% of total allocation.")
    elif len(sectors) > 1:
        insights.append(f"Exposure is spread across {len(sectors)} sectors, led by {dominant_sector}.")

    # Risk level
    insights.append(f"Risk level is {risk_level.lower()}, targeting an annualized volatility of approximately {risk * 100:.1f}%.")

    # Expected return
    insights.append(f"Expected annual return is approximately {expected_return * 100:.1f}%.")

    # Sharpe commentary
    if sharpe >= 1.5:
        insights.append(f"A Sharpe ratio of {sharpe:.2f} indicates strong risk-adjusted returns.")
    elif sharpe >= 0.8:
        insights.append(f"A Sharpe ratio of {sharpe:.2f} indicates reasonable risk-adjusted returns.")
    else:
        insights.append(f"A Sharpe ratio of {sharpe:.2f} suggests returns are not fully compensating for the risk taken.")

    return insights
