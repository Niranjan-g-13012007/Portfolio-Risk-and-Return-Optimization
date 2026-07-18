/**
 * App-wide toast notification system.
 * Usage: const { showToast } = useToast();
 *        showToast("Saved!", "success");
 */
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

let _nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast portal */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const colors = {
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    error:   "border-rose-500/40 bg-rose-500/10 text-rose-300",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    info:    "border-skyline-500/40 bg-skyline-500/10 text-skyline-300",
  };
  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-xl animate-fade-up ${colors[toast.type] ?? colors.info}`}
    >
      <span className="text-base leading-none">{icons[toast.type] ?? icons.info}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-2 opacity-60 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
}
