import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import NumberCounter from "./NumberCounter";

const stats = [
  { label: "Simulated portfolios per run", value: 10000, suffix: "" },
  { label: "Avg. Sharpe ratio uplift", value: 0.42, suffix: "x", decimals: 2 },
  { label: "Assets in the universe", value: 10, suffix: "" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-grid-glow pb-24 pt-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Modern Portfolio Theory, automated</span>
            </div>

            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find your
              <span className="bg-gradient-to-r from-emerald-400 to-skyline-400 bg-clip-text text-transparent">
                {" "}optimal portfolio{" "}
              </span>
              in seconds.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400">
              Pick your stocks, set your risk appetite, and let a quantitative
              engine map the efficient frontier to recommend the allocation
              with the best risk-adjusted return.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to="/analysis" className="btn-primary">
                Start Analysis <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn-secondary">
                How it works
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="kpi-value text-2xl sm:text-3xl">
                    <NumberCounter value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative"
          >
            <div className="glass-panel animate-float p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="section-label">Efficient Frontier</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
                  Live preview
                </span>
              </div>
              <svg viewBox="0 0 400 220" className="w-full">
                <defs>
                  <linearGradient id="frontierGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                {Array.from({ length: 60 }).map((_, i) => {
                  const x = 20 + Math.random() * 360;
                  const y = 20 + Math.random() * 180;
                  return <circle key={i} cx={x} cy={y} r="2.2" fill="#334155" opacity="0.5" />;
                })}
                <path
                  d="M 30 190 Q 120 60 380 20"
                  fill="none"
                  stroke="url(#frontierGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="380" cy="20" r="6" fill="#10B981" />
                <circle cx="30" cy="190" r="6" fill="#3B82F6" />
              </svg>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] text-slate-500">Max Sharpe</div>
                  <div className="font-display text-sm font-semibold text-emerald-400">1.82</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-[10px] text-slate-500">Min Volatility</div>
                  <div className="font-display text-sm font-semibold text-skyline-400">9.1%</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
