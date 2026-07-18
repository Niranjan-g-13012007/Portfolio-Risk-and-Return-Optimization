import { Link, NavLink } from "react-router-dom";
import { LineChart, LogIn, Moon, Sun, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";

const NAV_LINKS = [
  { to: "/",        label: "Home" },
  { to: "/analysis",label: "Analysis" },
  { to: "/compare", label: "Compare" },
];

export default function Navbar({ isDark, onToggleTheme }) {
  const { user, loading } = useAuth();

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-skyline-500 shadow-glow">
            <LineChart size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-white">
            Opti<span className="text-emerald-400">Vest</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Auth area — only render after loading to avoid flicker */}
          {!loading && (
            user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-secondary hidden !px-4 !py-2.5 text-sm sm:inline-flex"
                >
                  <LogIn size={14} /> Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary !px-4 !py-2.5 text-sm"
                >
                  <UserPlus size={14} /> Sign Up
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
}
