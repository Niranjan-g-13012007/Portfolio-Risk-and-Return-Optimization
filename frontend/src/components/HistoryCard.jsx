import { motion } from "framer-motion";
import { BarChart2, Calendar, Copy, Download, ExternalLink, GitCompare, Percent, ShieldAlert, Trash2, TrendingUp, Wallet } from "lucide-react";
import { formatCurrency, formatPercent, PERIOD_LABELS } from "../utils/formatters";

/**
 * A card representing one saved portfolio in the History page.
 */
export default function HistoryCard({ item, onOpen, onDelete, onCompare, onDownload, onDuplicate }) {
  const returnColor = item.expected_return >= 15 ? "text-emerald-400" : item.expected_return >= 8 ? "text-skyline-400" : "text-amber-400";
  const riskColor = item.portfolio_risk <= 15 ? "text-emerald-400" : item.portfolio_risk <= 25 ? "text-amber-400" : "text-rose-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className="glass-panel group relative flex flex-col gap-4 p-5 hover:border-white/20 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-white leading-tight truncate">
            {item.portfolio_name}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={11} />
            {new Date(item.created_at).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
            <span className="text-slate-700">·</span>
            <span>{PERIOD_LABELS[item.investment_period] ?? item.investment_period}</span>
          </div>
        </div>
        <div className="shrink-0 rounded-lg bg-white/5 px-3 py-1.5 text-right">
          <div className="text-xs text-slate-500">Amount</div>
          <div className="text-sm font-semibold text-white">
            {formatCurrency(item.investment_amount, { compact: true })}
          </div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <Metric icon={TrendingUp} label="Return" value={`${item.expected_return?.toFixed(1)}%`} color={returnColor} />
        <Metric icon={ShieldAlert} label="Risk" value={`${item.portfolio_risk?.toFixed(1)}%`} color={riskColor} />
        <Metric icon={Percent} label="Sharpe" value={item.sharpe_ratio?.toFixed(2)} color="text-skyline-400" />
      </div>

      {/* Stock chips */}
      <div className="flex flex-wrap gap-1.5">
        {(item.stocks ?? []).slice(0, 6).map((s) => (
          <span key={s} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {s}
          </span>
        ))}
        {(item.stocks ?? []).length > 6 && (
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-slate-500">
            +{item.stocks.length - 6}
          </span>
        )}
      </div>

      {/* Risk badge */}
      <div className="flex items-center gap-2">
        <RiskBadge level={item.risk_level} />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/8 pt-3 sm:grid-cols-3">
        <button onClick={() => onOpen(item)} className="action-btn text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10">
          <ExternalLink size={13} /> Open
        </button>
        <button onClick={() => onCompare(item)} className="action-btn text-skyline-400 border-skyline-500/20 hover:bg-skyline-500/10">
          <GitCompare size={13} /> Compare
        </button>
        <button onClick={() => onDownload(item)} className="action-btn text-slate-400 border-white/10 hover:bg-white/5">
          <Download size={13} /> Download
        </button>
        <button onClick={() => onDuplicate(item)} className="action-btn text-amber-400 border-amber-500/20 hover:bg-amber-500/10">
          <Copy size={13} /> Duplicate
        </button>
        <button onClick={() => onDelete(item.id)} className="action-btn col-span-1 sm:col-span-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </motion.div>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-white/8 bg-white/[0.02] p-2.5 text-center">
      <Icon size={13} className={`mb-1 ${color}`} />
      <div className={`text-sm font-bold leading-none ${color}`}>{value}</div>
      <div className="mt-0.5 text-[10px] text-slate-600">{label}</div>
    </div>
  );
}

function RiskBadge({ level }) {
  const colors = {
    Low:            "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "Lower Medium": "text-sky-400 bg-sky-500/10 border-sky-500/20",
    Medium:         "text-blue-400 bg-blue-500/10 border-blue-500/20",
    "Upper Medium": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    High:           "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${colors[level] ?? colors.Medium}`}>
      {level} Risk
    </span>
  );
}
