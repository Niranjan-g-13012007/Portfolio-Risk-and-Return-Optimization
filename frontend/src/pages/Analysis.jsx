import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Download, RefreshCcw } from "lucide-react";

import InvestmentForm from "../components/InvestmentForm";
import LoadingScreen from "../components/LoadingScreen";
import SummaryCards from "../components/SummaryCards";
import HealthScore from "../components/HealthScore";
import PortfolioTable from "../components/PortfolioTable";
import AllocationPieChart from "../components/AllocationPieChart";
import ReturnBarChart from "../components/ReturnBarChart";
import HistoricalLineChart from "../components/HistoricalLineChart";
import EfficientFrontierChart from "../components/EfficientFrontierChart";
import InsightsPanel from "../components/InsightsPanel";

import { downloadReportPdf, fetchStocks, optimizePortfolio } from "../services/api";

export default function Analysis() {
  const [stocks, setStocks] = useState([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchStocks()
      .then(setStocks)
      .catch((err) => setError(err.message))
      .finally(() => setStocksLoading(false));
  }, []);

  async function handleSubmit(payload) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await optimizePortfolio(payload);
      setResult(data);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadReport() {
    if (!result) return;
    setDownloading(true);
    try {
      await downloadReportPdf(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  }

  const selectedPoint = result ? { risk: result.risk, ret: result.expected_return } : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 text-center">
        <span className="section-label">Portfolio Analysis</span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Configure your portfolio
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Set your investment amount, choose your stocks, and pick a risk
          level — the optimizer takes care of the rest.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <div className="glass-panel h-fit p-6 sm:p-8">
          {stocksLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Loading stock universe…
            </div>
          ) : (
            <InvestmentForm stocks={stocks} loading={loading} onSubmit={handleSubmit} />
          )}
        </div>

        <div>
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" exit={{ opacity: 0 }}>
                <LoadingScreen />
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel flex items-start gap-3 border-rose-500/20 bg-rose-500/5 p-6"
              >
                <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-400" />
                <div>
                  <h3 className="font-display font-semibold text-white">Something went wrong</h3>
                  <p className="mt-1 text-sm text-slate-400">{error}</p>
                </div>
              </motion.div>
            )}

            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <RefreshCcw size={22} className="text-slate-500" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Your results will appear here
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Fill in the form and click "Analyze Portfolio" to generate
                  your optimal allocation, charts, and insights.
                </p>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div
                key="results"
                id="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-white">Your Optimal Portfolio</h2>
                  <button
                    onClick={handleDownloadReport}
                    disabled={downloading}
                    className="btn-secondary !py-2.5 text-sm"
                  >
                    <Download size={15} /> {downloading ? "Preparing PDF…" : "Download Report"}
                  </button>
                </div>

                <SummaryCards result={result} />

                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <HistoricalLineChart historicalPrices={result.historical_prices} />
                  </div>
                  <HealthScore result={result} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <AllocationPieChart allocation={result.allocation} />
                  <ReturnBarChart stockReturns={result.stock_returns} />
                </div>

                <EfficientFrontierChart
                  frontier={result.efficient_frontier}
                  maxSharpePoint={result.max_sharpe_point}
                  minVolPoint={result.min_vol_point}
                  selectedPoint={selectedPoint}
                />

                <div className="grid gap-6 lg:grid-cols-2">
                  <PortfolioTable allocation={result.allocation} />
                  <InsightsPanel insights={result.insights} isSimulated={result.is_simulated_data} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
