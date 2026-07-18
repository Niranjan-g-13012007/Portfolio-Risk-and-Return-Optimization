import { AnimatePresence, motion } from "framer-motion";
import { BookmarkX, LogIn, UserPlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Modal shown to guest users who click "Save to History".
 * Offers login, signup, or cancel.
 */
export default function GuestModal({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative rounded-2xl border border-white/10 bg-ink-950/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"
              >
                <X size={16} />
              </button>

              {/* Icon */}
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-skyline-500/20">
                <BookmarkX size={26} className="text-emerald-400" />
              </div>

              <h2 className="font-display text-xl font-semibold text-white">
                Sign in to save your portfolio
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Create a free account to save your portfolio history, compare
                analyses, and access them from anywhere.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="btn-primary w-full justify-center"
                >
                  <LogIn size={16} /> Sign In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="btn-secondary w-full justify-center"
                >
                  <UserPlus size={16} /> Create Account
                </button>
                <button
                  onClick={onClose}
                  className="py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Continue as guest
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
