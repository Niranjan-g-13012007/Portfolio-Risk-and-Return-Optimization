import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown, BookOpen, Download, Loader2, RefreshCcw, Search, SortAsc,
} from "lucide-react";
import HistoryCard from "../components/HistoryCard";
import { historyApi } from "../services/historyApi";
import { downloadReportPdf } from "../services/api";
import { useToast } from "../context/ToastContext";

const SORT_OPTIONS = [
  { value: "newest",   label: "Newest first" },
  { value: "oldest",   label: "Oldest first" },
  { value: "return",   label: "Highest return" },
  { value: "risk",     label: "Lowest risk" },
  { value: "sharpe",   label: "Best Sharpe" },
];

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const list = await historyApi.list();
      setItems(list);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this portfolio permanently?")) return;
    try {
      await historyApi.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      showToast("Portfolio deleted", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function handleOpen(item) {
    navigate(`/analysis`, { state: { savedResult: item } });
  }

  function handleCompare(item) {
    navigate("/compare", { state: { preloadedA: item } });
  }

  async function handleDownload(item) {
    try {
      // Reconstruct result shape for PDF download
      const result = {
        expected_return: item.expected_return,
        risk: item.portfolio_risk,
        sharpe: item.sharpe_ratio,
        projected_value: item.projected_value,
        allocation: item.allocation,
        stock_returns: item.stock_returns,
        historical_prices: item.historical_data,
        efficient_frontier: item.efficient_frontier,
        max_sharpe_point: item.max_sharpe_point,
        min_vol_point: item.min_vol_point,
        insights: item.insights,
        is_simulated_data: item.is_simulated_data,
        diversification_score: item.diversification_score,
        risk_score: item.risk_score,
        health_score: item.health_score,
        projected_profit: item.projected_profit,
      };
      await downloadReportPdf(result);
    } catch (err) {
      showToast("Could not download report: " + err.message, "error");
    }
  }

  function handleDuplicate(item) {
    navigate("/analysis", {
      state: {
        prefill: {
          stocks: item.stocks,
          risk: item.risk_level,
          period: item.investment_period,
          amount: item.investment_amount,
        },
      },
    });
  }

  const filtered = useMemo(() => {
    let list = items.filter((i) =>
      query.trim() === "" ||
      i.portfolio_name?.toLowerCase().includes(query.toLowerCase()) ||
      (i.stocks ?? []).some((s) => s.toLowerCase().includes(query.toLowerCase()))
    );
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (sort === "oldest") list = [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (sort === "return") list = [...list].sort((a, b) => b.expected_return - a.expected_return);
    if (sort === "risk")   list = [...list].sort((a, b) => a.portfolio_risk - b.portfolio_risk);
    if (sort === "sharpe") list = [...list].sort((a, b) => b.sharpe_ratio - a.sharpe_ratio);
    return list;
  }, [items, query, sort]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <span className="section-label">Portfolio History</span>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-white">Saved Portfolios</h1>
            <p className="mt-1 text-slate-400">
              {items.length} portfolio{items.length !== 1 ? "s" : ""} saved to your account
            </p>
          </div>
          <button onClick={load} className="btn-secondary !px-4 !py-2.5 text-sm">
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-wrap gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or symbol…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <SortAsc size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-8 text-sm text-white outline-none focus:border-emerald-500/50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-ink-950">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <BookOpen size={24} className="text-slate-500" />
          </div>
          <h3 className="font-display text-lg font-semibold text-white">
            {query ? "No portfolios match your search" : "No saved portfolios yet"}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {query ? "Try a different search term" : "Run an analysis and click Save to History"}
          </p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onOpen={handleOpen}
                onDelete={handleDelete}
                onCompare={handleCompare}
                onDownload={handleDownload}
                onDuplicate={handleDuplicate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
