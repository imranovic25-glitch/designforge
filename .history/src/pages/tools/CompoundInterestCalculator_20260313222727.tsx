import { useState, useMemo } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const faqItems = [
  {
    q: "What is compound interest?",
    a: "Compound interest is interest calculated on both the initial principal and the accumulated interest. Over time, this creates exponential growth compared to simple interest."
  },
  {
    q: "What is the compounding frequency?",
    a: "This determines how often interest is added to your balance. Higher frequency (e.g., monthly vs. annually) results in slightly more growth over time."
  },
  {
    q: "What's the difference between principal and monthly contribution?",
    a: "The principal is your initial investment. Monthly contributions are regular deposits you add over the investment period. Both grow with compound interest."
  }
];

const relatedGuides = [
  { title: "Compound Interest Explained", path: "/guides/compound-interest-explained" }
];

const relatedComparisons = [
  { title: "Best Investing Apps", path: "/comparisons/best-investing-apps" }
];

type Frequency = "monthly" | "quarterly" | "annually";

const frequencyOptions: { label: string; value: Frequency; periodsPerYear: number }[] = [
  { label: "Monthly", value: "monthly", periodsPerYear: 12 },
  { label: "Quarterly", value: "quarterly", periodsPerYear: 4 },
  { label: "Annually", value: "annually", periodsPerYear: 1 }
];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(20);
  const [annualRate, setAnnualRate] = useState(8);
  const [frequency, setFrequency] = useState<Frequency>("monthly");

  const { chartData, totalValue, totalContributions, totalInterest } = useMemo(() => {
    const freq = frequencyOptions.find((f) => f.value === frequency)!;
    const periodsPerYear = freq.periodsPerYear;
    const ratePerPeriod = annualRate / 100 / periodsPerYear;
    const contributionsPerPeriod = monthlyContribution * (12 / periodsPerYear);

    const data: { year: number; value: number; contributions: number }[] = [];
    let balance = principal;

    for (let year = 0; year <= years; year++) {
      data.push({
        year,
        value: Math.round(balance),
        contributions: Math.round(principal + monthlyContribution * 12 * year)
      });
      for (let p = 0; p < periodsPerYear; p++) {
        balance = (balance + contributionsPerPeriod) * (1 + ratePerPeriod);
      }
    }

    const finalContributions = principal + monthlyContribution * 12 * years;
    return {
      chartData: data,
      totalValue: Math.round(balance),
      totalContributions: Math.round(finalContributions),
      totalInterest: Math.round(balance - finalContributions)
    };
  }, [principal, monthlyContribution, years, annualRate, frequency]);

  return (
    <ToolLayout
      title="Compound Interest Calculator"
      description="Project the future value of your investments. See how principal, regular contributions, and time combine to build wealth."
      icon={<TrendingUp className="h-7 w-7" />}
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Compound Interest Calculator — Free Online Tool"
        description="Calculate compound interest on investments or savings with our free calculator. Set principal, rate, time, and compounding frequency."
        canonical="/tools/compound-interest-calculator"
        schema="WebApplication"
        appName="Compound Interest Calculator"
      />
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Initial Investment</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} min="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Monthly Contribution</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} min="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Annual Return Rate (%)</label>
            <input type="number" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} min="0" max="100" step="0.1"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Investment Period (Years)</label>
            <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} min="1" max="50"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white/40 mb-4 uppercase tracking-widest">Compounding Frequency</label>
          <div className="flex gap-3">
            {frequencyOptions.map((opt) => (
              <button key={opt.value} onClick={() => setFrequency(opt.value)}
                className={`flex-1 h-12 rounded-xl text-sm font-medium transition-all duration-300 border ${
                  frequency === opt.value ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                }`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-widest">Future Value</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(totalValue)}</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-widest">Total Contributed</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(totalContributions)}</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-widest">Interest Earned</p>
            <p className="text-2xl font-semibold text-green-400">{formatCurrency(totalInterest)}</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorContrib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} label={{ value: "Years", position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", color: "#fff" }}
                formatter={(val: number) => [formatCurrency(val), ""]} labelFormatter={(l) => `Year ${l}`} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }} />
              <Area type="monotone" dataKey="contributions" name="Contributions" stroke="#6b7280" fill="url(#colorContrib)" strokeWidth={2} />
              <Area type="monotone" dataKey="value" name="Total Value" stroke="#ffffff" fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ToolLayout>
  );
}
