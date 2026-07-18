import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, History, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Circular avatar button with initials + animated dropdown menu.
 * Shown in Navbar when user is authenticated.
 */
export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() ?? "U";
  const firstName = user?.name?.split(" ")[0] ?? "User";

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
      >
        {/* Avatar */}
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-skyline-500 text-xs font-bold text-white shadow-glow">
          {initial}
        </span>
        <span className="hidden text-sm font-medium text-slate-200 sm:block">
          {firstName}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-ink-950/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            {/* User info header */}
            <div className="border-b border-white/8 px-4 py-3">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <MenuItem icon={User} label="My Profile" to="/profile" onClose={() => setOpen(false)} />
              <MenuItem icon={History} label="History" to="/history" onClose={() => setOpen(false)} />
              <div className="my-1 border-t border-white/8" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon: Icon, label, to, onClose }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
    >
      <Icon size={15} className="text-slate-500" />
      {label}
    </Link>
  );
}
