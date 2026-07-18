import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "Downloading historical prices…",
  "Calculating daily & annual returns…",
  "Building the covariance matrix…",
  "Simulating 10,000 portfolios…",
  "Solving for the efficient frontier…",
  "Selecting your optimal allocation…",
];

export default function LoadingScreen() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 550);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="relative mb-8 h-16 w-16">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />
        <div
          className="absolute inset-2 animate-spin rounded-full border-2 border-white/5 border-t-skyline-400"
          style={{ animationDirection: "reverse", animationDuration: "1.4s" }}
        />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">Running the optimization engine</h3>
      <motion.p
        key={stepIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 text-sm text-slate-400"
      >
        {STEPS[stepIndex]}
      </motion.p>
      <div className="mt-6 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-skyline-500"
          initial={{ width: "5%" }}
          animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
    </div>
  );
}
