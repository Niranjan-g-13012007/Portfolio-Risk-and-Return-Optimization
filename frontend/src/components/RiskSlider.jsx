import { motion } from "framer-motion";
import { Anchor, BarChart2, Flame, Shield, TrendingUp } from "lucide-react";

const RISK_LEVELS = [
  {
    value: "Low",
    icon: Shield,
    label: "Low",
    tags: ["Conservative", "Lowest volatility"],
    color: "emerald",
    glow: "rgba(16,185,129,0.18)",
    active: "border-emerald-500/50 bg-emerald-500/10",
    iconColor: "text-emerald-400",
  },
  {
    value: "Lower Medium",
    icon: Anchor,
    label: "Lower Medium",
    tags: ["Slight growth", "Moderate stability"],
    color: "sky",
    glow: "rgba(56,189,248,0.18)",
    active: "border-sky-400/50 bg-sky-400/10",
    iconColor: "text-sky-400",
  },
  {
    value: "Medium",
    icon: BarChart2,
    label: "Medium",
    tags: ["Balanced", "Risk & return"],
    color: "blue",
    glow: "rgba(59,130,246,0.18)",
    active: "border-blue-500/50 bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    value: "Upper Medium",
    icon: TrendingUp,
    label: "Upper Medium",
    tags: ["Growth focused", "Mod. aggressive"],
    color: "amber",
    glow: "rgba(245,158,11,0.18)",
    active: "border-amber-400/50 bg-amber-400/10",
    iconColor: "text-amber-400",
  },
  {
    value: "High",
    icon: Flame,
    label: "High",
    tags: ["Aggressive", "Max growth"],
    color: "rose",
    glow: "rgba(244,63,94,0.18)",
    active: "border-rose-500/50 bg-rose-500/10",
    iconColor: "text-rose-400",
  },
];

export default function RiskSlider({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {RISK_LEVELS.map((level) => {
        const isActive = value === level.value;
        const Icon = level.icon;
        return (
          <motion.button
            type="button"
            key={level.value}
            onClick={() => onChange(level.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-200 ${
              isActive
                ? `${level.active} shadow-lg`
                : "border-white/10 bg-white/[0.02] hover:bg-white/5 hover:border-white/20"
            }`}
            style={isActive ? { boxShadow: `0 0 24px ${level.glow}` } : {}}
          >
            {/* Active dot */}
            {isActive && (
              <motion.span
                layoutId="risk-dot"
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-current"
                style={{ color: level.glow.replace("0.18", "1") }}
              />
            )}

            <Icon
              size={18}
              className={`transition-colors ${isActive ? level.iconColor : "text-slate-500"}`}
            />

            <span
              className={`font-display text-xs font-semibold leading-tight transition-colors ${
                isActive ? "text-white" : "text-slate-400"
              }`}
            >
              {level.label}
            </span>

            <div className="hidden space-y-0.5 sm:block">
              {level.tags.map((t) => (
                <p key={t} className="text-[10px] leading-tight text-slate-500">
                  {t}
                </p>
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

