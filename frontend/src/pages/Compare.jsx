import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from "recharts";
import {
  ArrowRight, GitCompare, Loader2, Sparkles, Trophy,
  TrendingUp, ShieldAlert, Percent, Wallet,
} from "lucide-react";
import { fetchStocks } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { compareApi } from "../services/compareApi";
import { historyApi } from "../services/historyApi";
import { fetchStocks, optimizePortfolio } from "../services/api";
import { useToast } from "../context/ToastContext";
import StockSelector from "../components/StockSelector";
import RiskSlider from "../components/RiskSlider";
import AllocationPieChart from "../components/AllocationPieChart";
import { PERIOD_LABELS, formatPercent } from "../utils/formatters";

const PERIOD_OPTIONS = Object.entries(PERIOD_LABELS);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toPercent(v) { return v != null ? `${Number(v).toFixed(2)}%` : "—"; }
function toFixed2(v)  { return v != null ? Number(v).toFixed(2) : "—"; }

function winnerOf(a, b, higherBetter) {
  if (a == null || b == null) return null;
  if (a === b) return "tie";
  return higherBetter ? (a > b ? "A" : "B") : (a < b ? "A" : "B");
}

function WinnerBadge({ winner, label }) {
  if (!winner || winner === "tie")
    return <span className="text-xs text-slate-500">Tied</span>;
  const isA = winner === "A";
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${isA ? "text-emerald-400" : "text-skyline-400"}`}>
      <Trophy size={11} />
      Portfolio {winner}
    </span>
  );
}

// ─── Compare Metric Row ───────────────────────────────────────────────────────

function MetricRow({ label, a, b, aFmt, bFmt, higherBetter }) {
  const winner = winnerOf(a, b, higherBetter);
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
      <div className="text-right">
        <div className={`text-lg font-bold ${winner === "A" ? "text-emerald-400" : "text-white"}`}>{aFmt ?? toPercent(a)}</div>
        {winner === "A" && <WinnerBadge winner="A" />}
      </div>
      <div className="text-center text-xs text-slate-500">{label}</div>
      <div className="text-left">
        <div className={`text-lg font-bold ${winner === "B" ? "text-skyline-400" : "text-white"}`}>{bFmt ?? toPercent(b)}</div>
        {winner === "B" && <WinnerBadge winner="B" />}
      </div>
    </div>
  );
}

// ─── Recommendation ───────────────────────────────────────────────────────────

function Recommendation({ pA, pB }) {
  const retA = pA?.expected_return, retB = pB?.expected_return;
  const riskA = pA?.portfolio_risk ?? pA?.risk, riskB = pB?.portfolio_risk ?? pB?.risk;
  const shrA = pA?.sharpe_ratio ?? pA?.sharpe, shrB = pB?.sharpe_ratio ?? pB?.sharpe;

  if (!retA || !retB) return null;

  let msg = "";
  const retWinner  = retA > retB ? "A" : "B";
  const riskWinner = riskA < riskB ? "A" : "B";
  const shrWinner  = shrA > shrB ? "A" : "B";

  if (shrWinner === retWinner && shrWinner === riskWinner) {
    msg = `Portfolio ${shrWinner} dominates across all metrics — it has higher risk-adjusted returns, lower volatility, and a better expected return. It's the clear winner.`;
  } else if (shrWinner !== retWinner) {
    msg = `Portfolio ${retWinner} offers a higher raw return, but Portfolio ${shrWinner} delivers better risk-adjusted performance (Sharpe ratio). For long-term investors, Portfolio ${shrWinner} may be the smarter choice.`;
  } else {
    msg = `Portfolio ${retWinner} provides higher expected returns while Portfolio ${riskWinner} carries lower risk. Choose based on your personal risk tolerance.`;
  }

  return (
    <div className="glass-panel border-emerald-500/20 bg-emerald-500/5 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-emerald-400" />
        <span className="section-label">Recommendation</span>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{msg}</p>
    </div>
  );
}

// ─── Mini Compare Form ────────────────────────────────────────────────────────

function MiniForm({ label, color, stocks, value, onChange }) {
  return (
    <div className={`glass-panel p-6 border-${color}-500/20`}>
      <div className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold text-${color}-400 bg-${color}-500/10 border border-${color}-500/20`}>
        {label}
      </div>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Amount (₹)</label>
          <input
            type="number"
            value={value.amount}
            onChange={(e) => onChange({ ...value, amount: Number(e.target.value) })}
            className="auth-input text-sm"
            min={1000}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Stocks (2–5)</label>
          <StockSelector stocks={stocks} selected={value.stocks} onChange={(s) => onChange({ ...value, stocks: s })} maxSelect={5} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Risk</label>
          <RiskSlider value={value.risk} onChange={(r) => onChange({ ...value, risk: r })} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">Period</label>
          <div className="grid grid-cols-4 gap-1.5">
            {PERIOD_OPTIONS.map(([v, l]) => (
              <label key={v} className="relative cursor-pointer">
                <input type="radio" className="peer sr-only" checked={value.period === v} onChange={() => onChange({ ...value, period: v })} />
                <div className="rounded-lg border border-white/10 py-1.5 text-center text-[11px] font-medium text-slate-400 transition-all peer-checked:border-emerald-500/40 peer-checked:bg-emerald-500/10 peer-checked:text-white hover:bg-white/5">
                  {l}
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Compare() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [mode, setMode] = useState("manual"); // "history" | "manual"
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [allStocks, setAllStocks] = useState([]);
  const [selectedA, setSelectedA] = useState("");
  const [selectedB, setSelectedB] = useState("");

  const defaultConfig = { amount: 100000, stocks: [], risk: "Medium", period: "1y" };
  const [configA, setConfigA] = useState(defaultConfig);
  const [configB, setConfigB] = useState(defaultConfig);

  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState(null); // { portfolio_a, portfolio_b }

  // Pre-load from Analysis or History page navigation
  useEffect(() => {
    const state = location.state ?? {};
    if (state.prefillA) {
      // Coming from Analysis "Compare Portfolio" → manual mode with A pre-filled
      setMode("manual");
      setConfigA({
        amount: state.prefillA.amount  || 100000,
        stocks: state.prefillA.stocks  || [],
        risk:   state.prefillA.risk    || "Medium",
        period: state.prefillA.period  || "1y",
      });
    } else if (state.preloadedA) {
      // Coming from History "Compare" button → history mode with A pre-selected
      setMode("history");
      setSelectedA(state.preloadedA.id ?? "");
    }
  }, []); // run once on mount

  // Load history if switching to history mode
  useEffect(() => {
    if (mode === "history" && user) {
      setHistoryLoading(true);
      historyApi.list()
        .then(setHistoryItems)
        .catch(() => {})
        .finally(() => setHistoryLoading(false));
    }
  }, [mode, user]);

  // Load stocks for manual mode
  useEffect(() => {
    if (mode === "manual") {
      fetchStocks().then(setAllStocks).catch(() => {});
    }
  }, [mode]);


  async function handleCompare() {
    setComparing(true);
    setResult(null);
    try {
      let res;
      if (mode === "history") {
        if (!selectedA || !selectedB) { showToast("Select both portfolios", "warning"); return; }
        if (selectedA === selectedB) { showToast("Select two different portfolios", "warning"); return; }
        res = await compareApi.fromHistory(selectedA, selectedB);
      } else {
        if (configA.stocks.length < 2 || configB.stocks.length < 2) {
          showToast("Each portfolio needs at least 2 stocks", "warning"); return;
        }
        res = await compareApi.manual(configA, configB);
        // Normalize field names for consistency
        res.portfolio_a = { ...res.portfolio_a, portfolio_risk: res.portfolio_a.risk, sharpe_ratio: res.portfolio_a.sharpe };
        res.portfolio_b = { ...res.portfolio_b, portfolio_risk: res.portfolio_b.risk, sharpe_ratio: res.portfolio_b.sharpe };
      }
      setResult(res);
      setTimeout(() => document.getElementById("compare-results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setComparing(false);
    }
  }

  const pA = result?.portfolio_a;
  const pB = result?.portfolio_b;
  const nameA = pA?.portfolio_name ?? "Portfolio A";
  const nameB = pB?.portfolio_name ?? "Portfolio B";

  // Radar data
  const radarData = pA && pB ? [
    { metric: "Return",      A: pA.expected_return ?? 0, B: pB.expected_return ?? 0 },
    { metric: "Risk",        A: 100 - (pA.portfolio_risk ?? pA.risk ?? 0), B: 100 - (pB.portfolio_risk ?? pB.risk ?? 0) },
    { metric: "Sharpe",      A: Math.min((pA.sharpe_ratio ?? pA.sharpe ?? 0) * 20, 100), B: Math.min((pB.sharpe_ratio ?? pB.sharpe ?? 0) * 20, 100) },
    { metric: "Health",      A: (pA.health_score ?? 50), B: (pB.health_score ?? 50) },
    { metric: "Diversif.",   A: (pA.diversification_score ?? 50), B: (pB.diversification_score ?? 50) },
  ] : [];

  const barData = pA && pB ? [
    { name: "Exp. Return %", A: pA.expected_return, B: pB.expected_return },
    { name: "Volatility %",  A: pA.portfolio_risk ?? pA.risk, B: pB.portfolio_risk ?? pB.risk },
    { name: "Sharpe Ratio",  A: pA.sharpe_ratio ?? pA.sharpe, B: pB.sharpe_ratio ?? pB.sharpe },
  ] : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
        <span className="section-label">Portfolio Comparison</span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Compare Portfolios
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Analyze two portfolios side by side across return, risk, Sharpe ratio, and allocation.
        </p>
      </motion.div>

      {/* Mode selector */}
      <div className="mb-8 flex justify-center">
        <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
          {[
            { value: "manual",  label: "Manual Comparison" },
            { value: "history", label: "From History",  disabled: !user },
          ].map((m) => (
            <button
              key={m.value}
              disabled={m.disabled}
              onClick={() => { setMode(m.value); setResult(null); }}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                mode === m.value
                  ? "bg-gradient-to-r from-emerald-500 to-skyline-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {m.label}
              {m.disabled && <span className="ml-1 text-[10px] opacity-60">(Login required)</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Input section */}
      <AnimatePresence mode="wait">
        {mode === "history" ? (
          <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
            {historyLoading ? (
              <div className="flex h-32 items-center justify-center"><Loader2 size={24} className="animate-spin text-emerald-400" /></div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { label: "Portfolio A", value: selectedA, setter: setSelectedA, color: "emerald" },
                  { label: "Portfolio B", value: selectedB, setter: setSelectedB, color: "sky" },
                ].map(({ label, value, setter, color }) => (
                  <div key={label} className="glass-panel p-6">
                    <label className={`mb-3 block text-sm font-semibold text-${color}-400`}>{label}</label>
                    <select
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50"
                    >
                      <option value="" className="bg-ink-950">— Select a saved portfolio —</option>
                      {historyItems.map((h) => (
                        <option key={h.id} value={h.id} className="bg-ink-950">
                          {h.portfolio_name} ({new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="manual" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
            <div className="grid gap-6 md:grid-cols-2">
              <MiniForm label="Portfolio A" color="emerald" stocks={allStocks} value={configA} onChange={setConfigA} />
              <MiniForm label="Portfolio B" color="sky" stocks={allStocks} value={configB} onChange={setConfigB} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare button */}
      <div className="mb-10 flex justify-center">
        <button onClick={handleCompare} disabled={comparing} className="btn-primary !px-10 !py-4 text-base">
          {comparing
            ? <><Loader2 size={18} className="animate-spin" /> Comparing portfolios…</>
            : <><GitCompare size={18} /> Compare Portfolios</>}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && pA && pB && (
          <motion.div
            id="compare-results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Portfolio headers */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: nameA, port: pA, color: "emerald" },
                { name: nameB, port: pB, color: "sky" },
              ].map(({ name, port, color }) => (
                <div key={name} className={`glass-panel border-${color}-500/20 p-5 text-center`}>
                  <div className={`text-xs font-semibold uppercase tracking-widest text-${color}-400 mb-2`}>{name}</div>
                  <div className="text-2xl font-bold text-white">{toPercent(port.expected_return)}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Expected Annual Return</div>
                </div>
              ))}
            </div>

            {/* Metric comparison table */}
            <div className="glass-panel p-6">
              <h2 className="mb-5 font-display text-lg font-semibold text-white">Side-by-Side Metrics</h2>
              <div className="space-y-3">
                <MetricRow label="Expected Return" a={pA.expected_return} b={pB.expected_return} higherBetter={true} />
                <MetricRow label="Portfolio Risk"  a={pA.portfolio_risk ?? pA.risk} b={pB.portfolio_risk ?? pB.risk} higherBetter={false} />
                <MetricRow label="Sharpe Ratio"    a={pA.sharpe_ratio ?? pA.sharpe} b={pB.sharpe_ratio ?? pB.sharpe} aFmt={toFixed2(pA.sharpe_ratio ?? pA.sharpe)} bFmt={toFixed2(pB.sharpe_ratio ?? pB.sharpe)} higherBetter={true} />
                <MetricRow label="Health Score"    a={pA.health_score} b={pB.health_score} aFmt={toFixed2(pA.health_score)} bFmt={toFixed2(pB.health_score)} higherBetter={true} />
                <MetricRow label="Diversification" a={pA.diversification_score} b={pB.diversification_score} aFmt={toFixed2(pA.diversification_score)} bFmt={toFixed2(pB.diversification_score)} higherBetter={true} />
              </div>
            </div>

            {/* Bar chart */}
            <div className="glass-panel p-6">
              <h2 className="mb-5 font-display text-lg font-semibold text-white">Metric Comparison</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} barCategoryGap="30%" barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 13 }} />
                  <Legend />
                  <Bar dataKey="A" name={nameA} fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="B" name={nameB} fill="#38BDF8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar chart */}
            {radarData.length > 0 && (
              <div className="glass-panel p-6">
                <h2 className="mb-5 font-display text-lg font-semibold text-white">Overall Performance Radar</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <Radar name={nameA} dataKey="A" stroke="#10B981" fill="#10B981" fillOpacity={0.15} strokeWidth={2} />
                    <Radar name={nameB} dataKey="B" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.15} strokeWidth={2} />
                    <Legend />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Allocation pies */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-panel p-6">
                <div className="mb-3 text-sm font-semibold text-emerald-400">{nameA} — Allocation</div>
                <AllocationPieChart allocation={pA.allocation} />
              </div>
              <div className="glass-panel p-6">
                <div className="mb-3 text-sm font-semibold text-skyline-400">{nameB} — Allocation</div>
                <AllocationPieChart allocation={pB.allocation} />
              </div>
            </div>

            {/* Recommendation */}
            <Recommendation pA={pA} pB={pB} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
