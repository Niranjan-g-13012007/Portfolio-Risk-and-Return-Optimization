import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle, Bookmark, BookmarkCheck, Download,
  GitCompare, Loader2, RefreshCcw, Sparkles,
} from "lucide-react";

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
import GuestModal from "../components/GuestModal";

import { downloadReportPdf, fetchStocks, optimizePortfolio } from "../services/api";
import { historyApi } from "../services/historyApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// ─── Helper: normalize a history item into the result shape the UI expects ───
function normalizeHistoryResult(item) {
  return {
    expected_return: item.expected_return,
    risk:            item.portfolio_risk,
    sharpe:          item.sharpe_ratio,
    projected_value: item.projected_value,
    projected_profit: item.projected_profit,
    allocation:      item.allocation       ?? [],
    stock_returns:   item.stock_returns    ?? [],
    historical_prices: item.historical_data ?? [],
    efficient_frontier: item.efficient_frontier ?? [],
    max_sharpe_point:   item.max_sharpe_point   ?? {},
    min_vol_point:      item.min_vol_point       ?? {},
    insights:           item.insights            ?? [],
    is_simulated_data:  item.is_simulated_data,
    diversification_score: item.diversification_score,
    risk_score:  item.risk_score,
    health_score: item.health_score,
  };
}

export default function Analysis() {
  const { user }     = useAuth();
  const { showToast } = useToast();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [stocks, setStocks]           = useState([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [result, setResult]           = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [saved, setSaved]             = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [prefill, setPrefill]         = useState(null);
  const [isSavedView, setIsSavedView] = useState(false); // viewing a history item

  // ── Handle navigation state from History page ───────────────────────────
  useEffect(() => {
    const { savedResult, prefill: pf } = location.state ?? {};

    if (savedResult) {
      // "Open" from History — show stored result immediately
      setResult(normalizeHistoryResult(savedResult));
      const req = {
        stocks: savedResult.stocks,
        risk:   savedResult.risk_level,
        period: savedResult.investment_period,
        amount: savedResult.investment_amount,
      };
      setCurrentRequest(req);
      setPrefill(req);
      setIsSavedView(true);
      setSaved(true);
    } else if (pf) {
      // "Duplicate" from History — pre-fill the form only
      setPrefill(pf);
    }
  }, []); // intentionally run once on mount

  // ── Load stock universe ─────────────────────────────────────────────────
  useEffect(() => {
    fetchStocks()
      .then(setStocks)
      .catch((err) => setError(err.message))
      .finally(() => setStocksLoading(false));
  }, []);

  // ── Optimize ────────────────────────────────────────────────────────────
  async function handleSubmit(payload) {
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setIsSavedView(false);
    setCurrentRequest(payload);
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

  // ── Download PDF ────────────────────────────────────────────────────────
  async function handleDownloadReport() {
    if (!result) return;
    setDownloading(true);
    try {
      await downloadReportPdf(result);
    } catch (err) {
      showToast("Could not generate PDF: " + err.message, "error");
    } finally {
      setDownloading(false);
    }
  }

  // ── Save to History ─────────────────────────────────────────────────────
  async function handleSave() {
    if (!user) { setGuestModalOpen(true); return; }
    if (saved)  { showToast("Already saved to history", "info"); return; }
    setIsSaving(true);
    try {
      await historyApi.save(result, {
        amount: currentRequest?.amount ?? 0,
        stocks: currentRequest?.stocks ?? [],
        risk:   currentRequest?.risk   ?? "",
        period: currentRequest?.period ?? "",
        name:   null,
      });
      setSaved(true);
      showToast("Portfolio saved to history! 📊", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Compare Portfolio ────────────────────────────────────────────────────
  function handleCompare() {
    navigate("/compare", {
      state: {
        prefillA: {
          stocks: currentRequest?.stocks ?? [],
          risk:   currentRequest?.risk   ?? "Medium",
          period: currentRequest?.period ?? "1y",
          amount: currentRequest?.amount ?? 100000,
        },
      },
    });
  }

  // ── Clear saved view → allow re-run ─────────────────────────────────────
  function handleReanalyze() {
    setResult(null);
    setIsSavedView(false);
    setSaved(false);
  }

  const selectedPoint = result ? { risk: result.risk, ret: result.expected_return } : null;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="mb-10 text-center">
        <span className="section-label">Portfolio Analysis</span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Configure your portfolio
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Set your investment, choose stocks, pick a risk level — the optimizer takes care of the rest.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        {/* ── Form panel ────────────────────────────────────────────── */}
        <div className="glass-panel h-fit p-6 sm:p-8">
          {stocksLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-slate-500">
              Loading stock universe…
            </div>
          ) : (
            <InvestmentForm
              stocks={stocks}
              loading={loading}
              onSubmit={handleSubmit}
              prefill={prefill}
            />
          )}
        </div>

        {/* ── Results panel ─────────────────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">
            {/* Loading */}
            {loading && (
              <motion.div key="loading" exit={{ opacity: 0 }}>
                <LoadingScreen />
              </motion.div>
            )}

            {/* Error */}
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

            {/* Empty state */}
            {!loading && !error && !result && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel flex h-full min-h-[420px] flex-col items-center justify-center p-10 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <Sparkles size={22} className="text-slate-500" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Your results will appear here
                </h3>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Fill in the form and click "Analyze Portfolio" to generate your optimal
                  allocation, charts, and insights.
                </p>
              </motion.div>
            )}

            {/* Results */}
            {!loading && result && (
              <motion.div
                key="results"
                id="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* ── Toolbar ──────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-white">
                      Your Optimal Portfolio
                    </h2>
                    {isSavedView && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Loaded from history — edit the form and re-analyze to refresh.
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Download Report */}
                    <button
                      onClick={handleDownloadReport}
                      disabled={downloading}
                      className="btn-secondary !py-2.5 text-sm"
                    >
                      <Download size={15} />
                      {downloading ? "Preparing…" : "Download"}
                    </button>

                    {/* Save to History */}
                    <button
                      onClick={handleSave}
                      disabled={isSaving || saved}
                      className={`btn-secondary !py-2.5 text-sm transition-colors ${
                        saved ? "border-emerald-500/30 !text-emerald-400" : ""
                      }`}
                    >
                      {isSaving ? (
                        <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      ) : saved ? (
                        <><BookmarkCheck size={15} /> Saved</>
                      ) : (
                        <><Bookmark size={15} /> Save</>
                      )}
                    </button>

                    {/* Compare Portfolio */}
                    <button
                      onClick={handleCompare}
                      className="btn-secondary !py-2.5 text-sm"
                    >
                      <GitCompare size={15} /> Compare
                    </button>

                    {/* Re-analyze (only when viewing a saved result) */}
                    {isSavedView && (
                      <button
                        onClick={handleReanalyze}
                        className="btn-secondary !py-2.5 text-sm"
                      >
                        <RefreshCcw size={15} /> Re-analyze
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Charts + metrics ─────────────────────────────── */}
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

      {/* Guest sign-in modal */}
      <GuestModal open={guestModalOpen} onClose={() => setGuestModalOpen(false)} />
    </div>
  );
}
