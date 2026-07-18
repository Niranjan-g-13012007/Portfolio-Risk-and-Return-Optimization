import { Shield, TrendingUp, Zap } from "lucide-react";

const RISK_LEVELS = [
  { value: "Low", icon: Shield, desc: "Prioritize stability, closer to the minimum-volatility portfolio." },
  { value: "Medium", icon: TrendingUp, desc: "Balanced risk and return along the efficient frontier." },
  { value: "High", icon: Zap, desc: "Prioritize growth, closer to the maximum Sharpe ratio portfolio." },
];

export default function RiskSlider({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {RISK_LEVELS.map((level) => {
        const isActive = value === level.value;
        return (
          <button
            type="button"
            key={level.value}
            onClick={() => onChange(level.value)}
            className={`group rounded-xl border p-4 text-left transition-all ${
              isActive
                ? "border-emerald-500/50 bg-emerald-500/10 shadow-glow"
                : "border-white/10 bg-white/[0.02] hover:bg-white/5"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <level.icon
                size={16}
                className={isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}
              />
              <span className={`font-display text-sm font-semibold ${isActive ? "text-white" : "text-slate-300"}`}>
                {level.value}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">{level.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
