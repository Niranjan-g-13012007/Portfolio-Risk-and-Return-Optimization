import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({ baseURL: BASE, timeout: 60000 });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("optivest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(new Error(e.response?.data?.detail || e.message || "Request failed"))
);

export const historyApi = {
  /** Save a complete analysis result to the user's history. */
  save: async (result, meta) => {
    const payload = {
      portfolio_name: meta?.name || null,
      investment_amount: meta?.amount ?? 0,
      stocks: meta?.stocks || [],
      risk_level: meta?.risk || "",
      investment_period: meta?.period || "",
      allocation: result.allocation,
      expected_return: result.expected_return,
      portfolio_risk: result.risk,
      sharpe_ratio: result.sharpe,
      historical_data: result.historical_prices,
      insights: result.insights,
      is_simulated_data: result.is_simulated_data,
      efficient_frontier: result.efficient_frontier,
      max_sharpe_point: result.max_sharpe_point,
      min_vol_point: result.min_vol_point,
      stock_returns: result.stock_returns,
      projected_value: result.projected_value,
      projected_profit: result.projected_profit,
      diversification_score: result.diversification_score,
      risk_score: result.risk_score,
      health_score: result.health_score,
    };
    const { data } = await client.post("/history/save", payload);
    return data;
  },

  /** List all portfolios for the current user (newest first). */
  list: async () => {
    const { data } = await client.get("/history");
    return data.history;
  },

  /** Fetch a single portfolio by ID. */
  get: async (id) => {
    const { data } = await client.get(`/history/${id}`);
    return data;
  },

  /** Delete a portfolio permanently. */
  delete: async (id) => {
    const { data } = await client.delete(`/history/${id}`);
    return data;
  },
};
