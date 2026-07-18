import { LineChart, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-slate-400">
            <LineChart size={16} className="text-emerald-400" />
            <span className="font-display text-sm font-medium text-slate-200">PortfolioIQ</span>
            <span className="text-xs">— Modern Portfolio Theory, in your browser.</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span>Built for demonstration purposes. Not investment advice.</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200"
            >
              <Github size={14} /> Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
