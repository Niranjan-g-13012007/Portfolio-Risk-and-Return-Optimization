import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STOCK_COLORS } from "../utils/formatters";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-glass">
      <div className="mb-1 font-semibold text-white">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.dataKey}: ${p.value?.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

export default function HistoricalLineChart({ historicalPrices }) {
  const { data, symbols } = useMemo(() => {
    if (!historicalPrices?.length) return { data: [], symbols: [] };
    const dates = historicalPrices[0].dates;
    const merged = dates.map((date, i) => {
      const point = { date };
      historicalPrices.forEach((series) => {
        point[series.symbol] = series.prices[i];
      });
      return point;
    });
    return { data: merged, symbols: historicalPrices.map((s) => s.symbol) };
  }, [historicalPrices]);

  return (
    <div className="glass-panel p-6">
      <span className="section-label">Historical Prices</span>
      <h3 className="mt-1 mb-4 font-display text-base font-semibold text-white">Price trend over the selected period</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          {symbols.map((symbol, i) => (
            <Line
              key={symbol}
              type="monotone"
              dataKey={symbol}
              stroke={STOCK_COLORS[i % STOCK_COLORS.length]}
              strokeWidth={2}
              dot={false}
              animationDuration={900}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
