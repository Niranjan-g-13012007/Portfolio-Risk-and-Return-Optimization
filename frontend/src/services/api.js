import axios from "axios";

// In dev, Vite proxies /api -> the FastAPI server (see vite.config.js).
// In production, set VITE_API_URL to the deployed backend URL.
const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  timeout: 60000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "Something went wrong talking to the server.";
    return Promise.reject(new Error(message));
  }
);

export async function fetchStocks() {
  const { data } = await api.get("/stocks");
  return data.stocks;
}

export async function optimizePortfolio(payload) {
  const { data } = await api.post("/optimize", payload);
  return data;
}

export async function downloadReportPdf(result) {
  const response = await api.post("/report/pdf", result, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "portfolio_report.pdf");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function checkHealth() {
  const { data } = await api.get("/");
  return data;
}
