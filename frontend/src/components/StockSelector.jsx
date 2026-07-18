import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { STOCK_COLORS } from "../utils/formatters";

export default function StockSelector({ stocks, selected, onChange, maxSelect = 6 }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return stocks;
    const q = query.toLowerCase();
    return stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [stocks, query]);

  function toggle(symbol) {
    if (selected.includes(symbol)) {
      onChange(selected.filter((s) => s !== symbol));
    } else {
      if (selected.length >= maxSelect) return;
      onChange([...selected, symbol]);
    }
  }

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks by name or symbol…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-emerald-500/50"
        />
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((symbol, i) => (
            <span
              key={symbol}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-2 text-xs font-medium text-white"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STOCK_COLORS[i % STOCK_COLORS.length] }}
              />
              {symbol}
              <button
                type="button"
                onClick={() => toggle(symbol)}
                className="rounded-full p-0.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.map((stock) => {
          const isSelected = selected.includes(stock.symbol);
          const disabled = !isSelected && selected.length >= maxSelect;
          return (
            <button
              type="button"
              key={stock.symbol}
              disabled={disabled}
              onClick={() => toggle(stock.symbol)}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                isSelected
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/5"
              } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
            >
              <div>
                <div className="text-sm font-semibold text-white">{stock.symbol}</div>
                <div className="text-xs text-slate-500">{stock.name}</div>
              </div>
              {isSelected && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 py-6 text-center text-sm text-slate-500">
            No stocks match "{query}".
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {selected.length}/{maxSelect} selected — choose at least 2 stocks.
      </p>
    </div>
  );
}
