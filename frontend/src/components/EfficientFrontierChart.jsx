import {
  CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-ink-900/95 px-3 py-2 text-xs shadow-glass">
      <div className="text-slate-400">Risk: {d.risk.toFixed(2)}%</div>
      <div className="text-slate-400">Return: {d.ret.toFixed(2)}%</div>
    </div>
  );
}

export default function EfficientFrontierChart({ frontier, maxSharpePoint, minVolPoint, selectedPoint }) {
  return (
    <div className="glass-panel p-6">
      <span className="section-label">Efficient Frontier</span>
      <h3 className="mt-1 mb-4 font-display text-base font-semibold text-white">10,000 simulated portfolios</h3>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ left: -10, top: 10, right: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            type="number"
            dataKey="risk"
            name="Risk"
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Volatility (Risk)", position: "insideBottom", offset: -4, fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="ret"
            name="Return"
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Expected Return", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
          />
          <ZAxis range={[18, 18]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={frontier} fill="#334155" opacity={0.55} />
          {minVolPoint && <Scatter data={[minVolPoint]} fill="#3B82F6" shape="diamond" />}
          {maxSharpePoint && <Scatter data={[maxSharpePoint]} fill="#10B981" shape="star" />}
          {selectedPoint && <Scatter data={[selectedPoint]} fill="#F59E0B" shape="triangle" />}
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-skyline-400" /> Min Volatility
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Max Sharpe
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Your Portfolio
        </span>
      </div>
    </div>
  );
}
