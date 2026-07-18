import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb } from "lucide-react";

export default function InsightsPanel({ insights, isSimulated }) {
  return (
    <div className="glass-panel p-6">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb size={16} className="text-emerald-400" />
        <span className="section-label">AI-Style Insights</span>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 text-sm text-slate-300"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
            {insight}
          </motion.li>
        ))}
      </ul>

      {isSimulated && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-300">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>
            Live market data was unavailable, so this result uses simulated
            price data for demonstration purposes.
          </span>
        </div>
      )}
    </div>
  );
}
