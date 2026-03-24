import { useState, useMemo } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { Landmark } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const faqItems = [
  {
    q: "What is EMI?",
    a: "EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a lender at a specified date each calendar month. It includes both principal and interest."
  },
  {
    q: "How is EMI calculated?",
    a: "EMI = [P × R × (1+R)^N] / [(1+R)^N – 1], where P is the principal, R is the monthly interest rate, and N is the number of months."
  },
  {
    q: "What's the difference between monthly and yearly loan terms?",
    a: "You can enter your loan term in either months or years. The calculator converts years to months automatically."
  }
];

const relatedGuides = [
  { title: "How Loan EMI Works", path: "/guides/how-loan-emi-works" }
];

const relatedComparisons = [
  { title: "Best Credit Cards", path: "/comparisons/best-credit-cards" }
];

type TermType = "months" | "years";

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

export function LoanEmiCalculator() {
  const [loanAmount, setLoanAmount] = useState(200000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [termType, setTermType] = useState<TermType>("years");

  const { emi, totalPayment, totalInterest, principalPct, interestPct } = useMemo(() => {
    const months = termType === "years" ? loanTerm * 12 : loanTerm;
    const monthlyRate = interestRate / 100 / 12;
    let emiVal = 0;
    if (monthlyRate === 0) {
      emiVal = loanAmount / months;
    } else {
      emiVal = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }
    const totalPay = emiVal * months;
    const totalInt = totalPay - loanAmount;
    return {
      emi: Math.round(emiVal),
      totalPayment: Math.round(totalPay),
      totalInterest: Math.round(totalInt),
      principalPct: Math.round((loanAmount / totalPay) * 100),
      interestPct: Math.round((totalInt / totalPay) * 100)
    };
  }, [loanAmount, interestRate, loanTerm, termType]);

  const pieData = [
    { name: "Principal", value: loanAmount },
    { name: "Total Interest", value: totalInterest }
  ];

  return (
    <ToolLayout
      title="Loan / EMI Calculator"
      description="Calculate your monthly loan payment and see the full picture of what borrowing really costs over the life of your loan."
      icon={<Landmark className="h-7 w-7" />}
      faqItems={faqItems}
      relatedGuides={relatedGuides}
      relatedComparisons={relatedComparisons}
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} min="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-9 pr-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Annual Interest Rate (%)</label>
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} min="0" max="100" step="0.1"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white/40 mb-3 uppercase tracking-widest">Loan Term</label>
            <div className="flex gap-3">
              <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(Number(e.target.value))} min="1"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 h-14 text-white font-medium focus:outline-none focus:border-white/30 transition-colors" />
              <div className="flex gap-2">
                {(["years", "months"] as TermType[]).map((t) => (
                  <button key={t} onClick={() => setTermType(t)}
                    className={`h-14 px-6 rounded-2xl text-sm font-medium transition-all duration-300 border ${
                      termType === t ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/70"
                    }`}>
                    {t === "years" ? "Years" : "Months"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-widest">Monthly EMI</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(emi)}</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-widest">Total Payment</p>
            <p className="text-2xl font-semibold text-white">{formatCurrency(totalPayment)}</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-xs font-medium text-white/40 mb-2 uppercase tracking-widest">Total Interest</p>
            <p className="text-2xl font-semibold text-red-400">{formatCurrency(totalInterest)}</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <p className="text-sm font-medium text-white/40 mb-6 uppercase tracking-widest text-center">Payment Breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  <Cell fill="rgba(255,255,255,0.8)" />
                  <Cell fill="rgba(239,68,68,0.6)" />
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", color: "#fff" }}
                  formatter={(val: number) => [formatCurrency(val), ""]} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2 text-center text-sm">
            <div>
              <p className="text-white/40 mb-1">Principal</p>
              <p className="text-white font-medium">{principalPct}%</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Interest</p>
              <p className="text-red-400 font-medium">{interestPct}%</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/20 font-light leading-relaxed">
          This calculator provides estimates for educational purposes only. Actual loan terms, rates, and fees will vary by lender. Always consult with a financial advisor or lender before making borrowing decisions.
        </p>
      </div>
    </ToolLayout>
  );
}
