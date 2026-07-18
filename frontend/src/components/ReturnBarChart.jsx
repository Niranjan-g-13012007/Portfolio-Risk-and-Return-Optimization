import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { STOCK_COLORS } from "../utils/formatters";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-glass">
      <div className="font-semibold text-white">{label}</div>
      <div className="text-slate-400">Annual return: {payload[0].value.toFixed(2)}%</div>
    </div>
  );
}

export default function ReturnBarChart({ stockReturns }) {
  return (
    <div className="glass-panel p-6">
      <span className="section-label">Individual Stock Returns</span>
      <h3 className="mt-1 mb-4 font-display text-base font-semibold text-white">Annualized return by stock</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={stockReturns} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="symbol" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="annual_return" radius={[6, 6, 0, 0]} animationDuration={900}>
            {stockReturns.map((entry, i) => (
              <Cell key={entry.symbol} fill={STOCK_COLORS[i % STOCK_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
