import { useState, useMemo } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Home, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const faqItems = [
  {
    question: "How is the monthly payment calculated?",
    answer:
      "The tool uses the standard amortisation formula: M = P × [r(1+r)^n] / [(1+r)^n − 1], where P is the loan principal, r is the monthly interest rate, and n is the total number of payments."
  },
  {
    question: "Does it include property tax and insurance?",
    answer:
      "Yes. You can enter annual property tax and annual homeowner's insurance. These are divided by 12 and added to the monthly mortgage payment to show total monthly cost."
  },
  {
    question: "What about PMI?",
    answer:
      "If your down payment is less than 20%, the calculator estimates Private Mortgage Insurance (PMI) at 0.5% of the loan annually and includes it in the monthly total."
  },
  {
    question: "Is my data stored anywhere?",
    answer:
      "No. All calculations run in your browser. Nothing is sent to any server."
  }
];

const relatedGuides: { title: string; path: string }[] = [
  { title: "How Loan EMI Works", path: "/guides/how-loan-emi-works" },
  { title: "Compound Interest Explained", path: "/guides/compound-interest-explained" },
];
const relatedComparisons: { title: string; path: string }[] = [
  { title: "Best Budgeting Apps", path: "/comparisons/best-budgeting-apps" },
];

function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function calcMortgage(
  homePrice: number,
  downPayment: number,
  rate: number,
  termYears: number,
  annualTax: number,
  annualInsurance: number
) {
  const principal = homePrice - downPayment;
  if (principal <= 0 || rate <= 0 || termYears <= 0) {
    return { monthly: 0, principalAndInterest: 0, totalInterest: 0, totalCost: 0, monthlyTax: 0, monthlyInsurance: 0, monthlyPmi: 0 };
  }

  const r = rate / 100 / 12;
  const n = termYears * 12;
  const pi = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const monthlyTax = annualTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const ltv = principal / homePrice;
  const monthlyPmi = ltv > 0.8 ? (principal * 0.005) / 12 : 0;

  const monthly = pi + monthlyTax + monthlyInsurance + monthlyPmi;
  const totalCost = pi * n + annualTax * termYears + annualInsurance * termYears + monthlyPmi * n;
  const totalInterest = pi * n - principal;

  return { monthly, principalAndInterest: pi, totalInterest, totalCost, monthlyTax, monthlyInsurance, monthlyPmi };
}

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState(350000);
  const [downPayment, setDownPayment] = useState(70000);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [annualTax, setAnnualTax] = useState(4200);
  const [annualInsurance, setAnnualInsurance] = useState(1400);

  const result = useMemo(
    () => calcMortgage(homePrice, downPayment, rate, termYears, annualTax, annualInsurance),
    [homePrice, downPayment, rate, termYears, annualTax, annualInsurance]
  );

  const downPaymentPct = homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(1) : "0";

  const reset = () => {
    setHomePrice(350000);
    setDownPayment(70000);
    setRate(6.5);
    setTermYears(30);
    setAnnualTax(4200);
    setAnnualInsurance(1400);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/25 transition-colors";

  // Donut chart data
  const segments = [
    { label: "Principal & Interest", value: result.principalAndInterest, color: "#f59e0b" },
    { label: "Property Tax", value: result.monthlyTax, color: "#8b5cf6" },
    { label: "Insurance", value: result.monthlyInsurance, color: "#10b981" },
    ...(result.monthlyPmi > 0 ? [{ label: "PMI", value: result.monthlyPmi, color: "#ef4444" }] : []),
  ];
  const segmentTotal = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <ToolLayout
      title="Mortgage Calculator"
      description="Calculate your monthly mortgage payment including principal, interest, property tax, insurance, and PMI."
      icon={<Home className="h-7 w-7" />}
      toolSlug="mortgage-calculator"
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <SEOHead
        title="Free Mortgage Calculator — Monthly Payment & Amortisation"
        description="Calculate monthly mortgage payments with property tax, insurance, and PMI. Visual breakdown of costs. Free, runs in your browser."
        canonical="/tools/mortgage-calculator"
        schema="WebApplication"
        appName="Mortgage Calculator"
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Inputs */}
          <div className="space-y-5">
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Home Price</label>
              <input
                type="number"
                min={0}
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">
                Down Payment <span className="text-amber-400/60">({downPaymentPct}%)</span>
              </label>
              <input
                type="number"
                min={0}
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Loan Term (years)</label>
                <div className="flex gap-2">
                  {[15, 20, 30].map((y) => (
                    <button
                      key={y}
                      onClick={() => setTermYears(y)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                        termYears === y
                          ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                          : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60"
                      }`}
                    >
                      {y}yr
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Annual Property Tax</label>
                <input
                  type="number"
                  min={0}
                  value={annualTax}
                  onChange={(e) => setAnnualTax(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-widest mb-2">Annual Insurance</label>
                <input
                  type="number"
                  min={0}
                  value={annualInsurance}
                  onChange={(e) => setAnnualInsurance(Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Estimated Monthly Payment</p>
              <p className="text-4xl md:text-5xl font-bold text-amber-400 tabular-nums">
                {formatCurrency(result.monthly)}
              </p>
              <p className="text-white/30 text-sm mt-1">/month</p>
            </div>

            {/* Donut-style breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-6">
                {/* Mini donut */}
                <svg width="100" height="100" viewBox="0 0 36 36" className="shrink-0">
                  {(() => {
                    let cumulative = 0;
                    return segments.map((seg, i) => {
                      const pct = segmentTotal > 0 ? (seg.value / segmentTotal) * 100 : 0;
                      const offset = 100 - cumulative + 25;
                      cumulative += pct;
                      return (
                        <circle
                          key={i}
                          cx="18" cy="18" r="15.5"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="4"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="space-y-2 flex-1">
                  {segments.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-white/50">{seg.label}</span>
                      </div>
                      <span className="text-white font-medium tabular-nums">{formatCurrency(seg.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Interest</p>
                <p className="text-lg font-semibold text-white tabular-nums">{formatCurrency(result.totalInterest)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Cost</p>
                <p className="text-lg font-semibold text-white tabular-nums">{formatCurrency(result.totalCost)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="flex gap-4">
          <Button
            onClick={reset}
            variant="outline"
            className="rounded-full px-8 h-12 border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
