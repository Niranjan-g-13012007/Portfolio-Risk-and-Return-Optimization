import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({ baseURL: BASE, timeout: 120000 });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("optivest_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (e) => Promise.reject(new Error(e.response?.data?.detail || e.message || "Request failed"))
);

export const compareApi = {
  /** Compare two portfolios already in the user's history. */
  fromHistory: async (idA, idB) => {
    const { data } = await client.post("/compare/history", {
      history_id_a: idA,
      history_id_b: idB,
    });
    return data; // { portfolio_a, portfolio_b }
  },

  /**
   * Run two independent optimizations and compare.
   * payloadA/B: { stocks, risk, period, amount }
   */
  manual: async (payloadA, payloadB) => {
    const { data } = await client.post("/compare/manual", {
      portfolio_a: payloadA,
      portfolio_b: payloadB,
    });
    return data; // { portfolio_a, portfolio_b }
  },
};
