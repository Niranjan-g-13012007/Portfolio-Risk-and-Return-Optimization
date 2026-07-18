import { Link, NavLink } from "react-router-dom";
import { LineChart, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ isDark, onToggleTheme }) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-skyline-500 shadow-glow">
            <LineChart size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Portfolio<span className="text-emerald-400">IQ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/analysis"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            Portfolio Analysis
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/analysis" className="btn-primary hidden !px-5 !py-2.5 text-sm sm:inline-flex">
            Start Analysis
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
