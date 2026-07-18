import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";

function Meter({ label, value, color }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono font-medium text-slate-200">{value.toFixed(0)}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function HealthScore({ result }) {
  const score = result.health_score;
  const scoreColor = score >= 70 ? "#10B981" : score >= 45 ? "#F59E0B" : "#F43F5E";

  return (
    <div className="glass-panel p-6">
      <div className="mb-5 flex items-center gap-2">
        <HeartPulse size={16} className="text-emerald-400" />
        <span className="section-label">Portfolio Health</span>
      </div>

      <div className="mb-6 flex items-center gap-5">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle
              cx="50" cy="50" r="42" fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <span className="absolute font-display text-xl font-bold text-white">{score.toFixed(0)}</span>
        </div>
        <div className="text-sm text-slate-400">
          {score >= 70
            ? "Strong risk-adjusted return with good diversification."
            : score >= 45
            ? "Reasonable balance of risk and return."
            : "Consider adding more assets to improve diversification."}
        </div>
      </div>

      <div className="space-y-4">
        <Meter label="Diversification Score" value={result.diversification_score} color="#3B82F6" />
        <Meter label="Risk Meter" value={result.risk_score} color="#F59E0B" />
        <Meter label="Return Potential" value={Math.min(100, result.expected_return * 2.5)} color="#10B981" />
      </div>
    </div>
  );
}
