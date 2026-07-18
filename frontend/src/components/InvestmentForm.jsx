import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { IndianRupee, Loader2, Sparkles } from "lucide-react";
import StockSelector from "./StockSelector";
import RiskSlider from "./RiskSlider";
import { PERIOD_LABELS } from "../utils/formatters";

const PERIOD_OPTIONS = Object.entries(PERIOD_LABELS);

export default function InvestmentForm({ stocks, loading, onSubmit, prefill }) {
  const [selectedStocks, setSelectedStocks] = useState(
    prefill?.stocks?.length ? prefill.stocks : ["AAPL", "MSFT", "NVDA"]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: prefill?.amount ?? 100000,
      risk:   prefill?.risk   ?? "Medium",
      period: prefill?.period ?? "1y",
    },
  });

  function submit(values) {
    if (selectedStocks.length < 2) return;
    onSubmit({
      amount: Number(values.amount),
      risk: values.risk,
      period: values.period,
      stocks: selectedStocks,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {/* Investment Amount */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Investment Amount</label>
        <div className="relative">
          <IndianRupee size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="number"
            min={1000}
            step={1000}
            {...register("amount", { required: true, min: 1000 })}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-10 pr-4 text-lg font-semibold text-white outline-none transition-colors focus:border-emerald-500/50"
            placeholder="100000"
          />
        </div>
        {errors.amount && <p className="mt-1.5 text-xs text-rose-400">Enter an amount of at least ₹1,000.</p>}
      </div>

      {/* Stock Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          Select Stocks
          <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-slate-500">
            2 – 10 stocks
          </span>
        </label>
        <StockSelector stocks={stocks} selected={selectedStocks} onChange={setSelectedStocks} maxSelect={10} />
        {selectedStocks.length < 2 && (
          <p className="mt-1.5 text-xs text-amber-400">Select at least 2 stocks to continue.</p>
        )}
      </div>

      {/* Risk Preference */}
      <div>
        <label className="mb-3 block text-sm font-medium text-slate-300">Risk Preference</label>
        <Controller
          name="risk"
          control={control}
          render={({ field }) => <RiskSlider value={field.value} onChange={field.onChange} />}
        />
      </div>

      {/* Investment Period */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">Investment Period</label>
        <div className="grid grid-cols-4 gap-2">
          {PERIOD_OPTIONS.map(([value, label]) => (
            <label key={value} className="relative">
              <input type="radio" value={value} {...register("period")} className="peer sr-only" />
              <div className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] py-2.5 text-center text-xs font-medium text-slate-300 transition-all peer-checked:border-skyline-500/50 peer-checked:bg-skyline-500/10 peer-checked:text-white hover:bg-white/5">
                {label}
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || selectedStocks.length < 2}
        className="btn-primary w-full !py-4 text-base"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Optimizing your portfolio…
          </>
        ) : (
          <>
            <Sparkles size={18} /> Analyze Portfolio
          </>
        )}
      </button>
    </form>
  );
}

