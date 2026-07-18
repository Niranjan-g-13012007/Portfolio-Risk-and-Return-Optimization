export function formatCurrency(value, options = {}) {
  const { compact = false } = options;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value ?? 0);
}

export function formatPercent(value, decimals = 2) {
  return `${(value ?? 0).toFixed(decimals)}%`;
}

export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: decimals,
  }).format(value ?? 0);
}

export const STOCK_COLORS = [
  "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6",
  "#06B6D4", "#F43F5E", "#84CC16", "#EAB308", "#6366F1",
  "#14B8A6", "#F97316", "#A855F7", "#22D3EE", "#4ADE80",
  "#FB923C", "#E879F9", "#38BDF8", "#A3E635", "#FACC15",
];

export const PERIOD_LABELS = {
  "1mo":  "1 Month",
  "6mo":  "6 Months",
  "1y":   "1 Year",
  "3y":   "3 Years",
  "5y":   "5 Years",
  "7y":   "7 Years",
  "10y":  "10 Years",
  "15y":  "15 Years",
};

