import { motion } from "framer-motion";
import { ArrowRight, LineChart, PieChart, ShieldCheck, Sliders } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "../components/Hero";

const steps = [
  {
    icon: Sliders,
    title: "Set your parameters",
    text: "Enter your investment amount, choose from ten liquid large-cap stocks, and pick a risk appetite.",
  },
  {
    icon: LineChart,
    title: "We run the math",
    text: "10,000 simulated portfolios are generated and scored against the efficient frontier using Modern Portfolio Theory.",
  },
  {
    icon: PieChart,
    title: "Get your allocation",
    text: "Receive the weight for each stock, expected return, volatility, and Sharpe ratio — visualized instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Understand the risk",
    text: "A diversification score and portfolio health score translate the math into a plain-language read.",
  },
];

export default function Home() {
  return (
    <div>
      <Hero />

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 text-center">
          <span className="section-label">How it works</span>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
            From raw prices to an optimal allocation
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Four steps, powered by historical market data and a quantitative
            optimization engine running scipy under the hood.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-panel p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-skyline-500/20">
                <step.icon size={20} className="text-emerald-400" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28">
        <div className="glass-panel relative overflow-hidden p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-skyline-500/10 blur-[100px]" />
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            Ready to see your optimal allocation?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-400">
            It takes less than a minute to configure and run your first
            analysis.
          </p>
          <Link to="/analysis" className="btn-primary mt-8">
            Start Analysis <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
