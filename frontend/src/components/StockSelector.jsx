import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { STOCK_COLORS } from "../utils/formatters";

const MARKET_META = {
  US:     { label: "🇺🇸 US Stocks",     badge: "bg-blue-500/15 text-blue-300 border-blue-500/20" },
  IN:     { label: "🇮🇳 Indian (NSE)",   badge: "bg-orange-500/15 text-orange-300 border-orange-500/20" },
  GLOBAL: { label: "🌐 Global",          badge: "bg-purple-500/15 text-purple-300 border-purple-500/20" },
};

const CHIP_MARKET_COLORS = {
  US:     "border-blue-500/30 bg-blue-500/10",
  IN:     "border-orange-500/30 bg-orange-500/10",
  GLOBAL: "border-purple-500/30 bg-purple-500/10",
};

export default function StockSelector({ stocks, selected, onChange, maxSelect = 10 }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const stockMap = useMemo(() => Object.fromEntries(stocks.map((s) => [s.symbol, s])), [stocks]);

  // Filtered + grouped
  const grouped = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? stocks.filter(
          (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
        )
      : stocks;
    return ["US", "IN", "GLOBAL"].reduce((acc, market) => {
      const items = filtered.filter((s) => s.market === market);
      if (items.length) acc[market] = items;
      return acc;
    }, {});
  }, [stocks, query]);

  function toggle(symbol) {
    if (selected.includes(symbol)) {
      onChange(selected.filter((s) => s !== symbol));
    } else {
      if (selected.length >= maxSelect) return;
      onChange([...selected, symbol]);
    }
  }

  const totalFiltered = Object.values(grouped).flat().length;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-left transition-colors hover:border-white/20 focus:outline-none focus:border-emerald-500/50"
      >
        <span className="text-sm text-slate-400">
          {selected.length === 0
            ? "Search and select stocks…"
            : `${selected.length} stock${selected.length > 1 ? "s" : ""} selected`}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <AnimatePresence>
            {selected.map((symbol, i) => {
              const stock = stockMap[symbol];
              const market = stock?.market ?? "US";
              return (
                <motion.span
                  key={symbol}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.75 }}
                  transition={{ duration: 0.15 }}
                  className={`inline-flex items-center gap-1.5 rounded-full border py-1.5 pl-2.5 pr-2 text-xs font-medium text-white ${CHIP_MARKET_COLORS[market]}`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: STOCK_COLORS[i % STOCK_COLORS.length] }}
                  />
                  <span className="font-semibold">{symbol}</span>
                  <button
                    type="button"
                    onClick={() => toggle(symbol)}
                    className="rounded-full p-0.5 text-slate-400 hover:bg-white/15 hover:text-white"
                  >
                    <X size={11} strokeWidth={2.5} />
                  </button>
                </motion.span>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
          >
            {/* Search */}
            <div className="border-b border-white/8 p-3">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or symbol…"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500/50"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Grouped list */}
            <div className="max-h-80 overflow-y-auto overscroll-contain p-2">
              {totalFiltered === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  No stocks match "{query}"
                </div>
              ) : (
                Object.entries(grouped).map(([market, items]) => (
                  <div key={market} className="mb-3 last:mb-0">
                    {/* Market header */}
                    <div className={`mb-1.5 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold ${MARKET_META[market].badge}`}>
                      {MARKET_META[market].label}
                      <span className="ml-auto opacity-60">{items.length}</span>
                    </div>

                    {/* Stock rows */}
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {items.map((stock) => {
                        const isSelected = selected.includes(stock.symbol);
                        const disabled = !isSelected && selected.length >= maxSelect;
                        return (
                          <button
                            type="button"
                            key={stock.symbol}
                            disabled={disabled}
                            onClick={() => toggle(stock.symbol)}
                            className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 ${
                              isSelected
                                ? "border-emerald-500/40 bg-emerald-500/10"
                                : "border-transparent bg-white/[0.02] hover:border-white/10 hover:bg-white/5"
                            } ${disabled ? "cursor-not-allowed opacity-35" : "cursor-pointer"}`}
                          >
                            {/* Colour dot */}
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                isSelected ? "bg-emerald-500/20" : "bg-white/5"
                              }`}
                              style={isSelected ? { color: "#10B981" } : { color: "#64748B" }}
                            >
                              {stock.symbol.slice(0, 2)}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-white leading-none">
                                  {stock.symbol}
                                </span>
                                <span className={`rounded px-1 py-0.5 text-[10px] font-medium border ${MARKET_META[market].badge}`}>
                                  {stock.sector.split(" ")[0]}
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-xs text-slate-500">{stock.name}</div>
                            </div>

                            {isSelected && (
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                                <Check size={11} className="text-white" strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/8 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
              <span>{selected.length} / {maxSelect} selected</span>
              {selected.length >= maxSelect && (
                <span className="text-amber-400">Maximum reached — remove a stock to add another</span>
              )}
              {selected.length > 0 && selected.length < maxSelect && (
                <span>Choose at least 2 stocks</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

