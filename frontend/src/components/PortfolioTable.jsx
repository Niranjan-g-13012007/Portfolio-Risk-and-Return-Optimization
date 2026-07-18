import { STOCK_COLORS, formatCurrency, formatPercent } from "../utils/formatters";

export default function PortfolioTable({ allocation }) {
  return (
    <div className="glass-panel overflow-hidden p-0">
      <div className="border-b border-white/10 p-5">
        <span className="section-label">Portfolio Allocation</span>
        <h3 className="mt-1 font-display text-base font-semibold text-white">Stock-by-stock breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Weight</th>
              <th className="px-5 py-3 font-medium">Invested</th>
              <th className="px-5 py-3 font-medium">Expected Contribution</th>
              <th className="px-5 py-3 font-medium">Projected Profit</th>
            </tr>
          </thead>
          <tbody>
            {allocation
              .slice()
              .sort((a, b) => b.weight - a.weight)
              .map((row, i) => (
                <tr key={row.symbol} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: STOCK_COLORS[i % STOCK_COLORS.length] }}
                      />
                      <div>
                        <div className="font-semibold text-white">{row.symbol}</div>
                        <div className="text-xs text-slate-500">{row.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-200">{formatPercent(row.weight)}</td>
                  <td className="px-5 py-3.5 text-slate-300">{formatCurrency(row.invested_amount)}</td>
                  <td className="px-5 py-3.5 text-slate-300">{formatPercent(row.expected_contribution)}</td>
                  <td
                    className={`px-5 py-3.5 font-medium ${
                      row.projected_profit >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {row.projected_profit >= 0 ? "+" : ""}
                    {formatCurrency(row.projected_profit)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
