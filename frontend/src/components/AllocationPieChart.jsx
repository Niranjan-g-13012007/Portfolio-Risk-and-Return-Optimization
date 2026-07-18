import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STOCK_COLORS, formatPercent } from "../utils/formatters";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-glass">
      <div className="font-semibold text-white">{d.symbol}</div>
      <div className="text-slate-400">{formatPercent(d.weight)}</div>
    </div>
  );
}

export default function AllocationPieChart({ allocation }) {
  const data = allocation.map((a) => ({ symbol: a.symbol, weight: a.weight }));

  return (
    <div className="glass-panel p-6">
      <span className="section-label">Portfolio Allocation</span>
      <h3 className="mt-1 mb-4 font-display text-base font-semibold text-white">Weight distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="weight"
            nameKey="symbol"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            animationDuration={900}
          >
            {data.map((entry, i) => (
              <Cell key={entry.symbol} fill={STOCK_COLORS[i % STOCK_COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
