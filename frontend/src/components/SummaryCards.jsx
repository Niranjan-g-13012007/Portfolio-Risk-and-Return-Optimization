import { motion } from "framer-motion";
import { Percent, ShieldAlert, TrendingUp, Wallet } from "lucide-react";
import NumberCounter from "./NumberCounter";
import { formatCurrency } from "../utils/formatters";

export default function SummaryCards({ result }) {
  const cards = [
    {
      label: "Expected Annual Return",
      value: result.expected_return,
      decimals: 2,
      suffix: "%",
      icon: TrendingUp,
      accent: "text-emerald-400",
      glow: "from-emerald-500/15",
    },
    {
      label: "Portfolio Risk (Volatility)",
      value: result.risk,
      decimals: 2,
      suffix: "%",
      icon: ShieldAlert,
      accent: "text-amber-400",
      glow: "from-amber-500/15",
    },
    {
      label: "Sharpe Ratio",
      value: result.sharpe,
      decimals: 2,
      suffix: "",
      icon: Percent,
      accent: "text-skyline-400",
      glow: "from-skyline-500/15",
    },
    {
      label: "Projected Value",
      value: result.projected_value,
      decimals: 0,
      suffix: "",
      icon: Wallet,
      accent: "text-white",
      glow: "from-white/10",
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08 }}
          className={`glass-panel relative overflow-hidden p-5`}
        >
          <div className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.glow} to-transparent blur-2xl`} />
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
            <card.icon size={16} className={card.accent} />
          </div>
          <div className="section-label mb-1">{card.label}</div>
          <div className={`kpi-value ${card.accent}`}>
            {card.isCurrency ? (
              formatCurrency(card.value, { compact: true })
            ) : (
              <NumberCounter value={card.value} decimals={card.decimals} suffix={card.suffix} />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
