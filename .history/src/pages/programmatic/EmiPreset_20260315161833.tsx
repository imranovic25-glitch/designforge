import { useParams, Link } from "react-router-dom";
import { useMemo } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Landmark, ArrowRight, TrendingDown, Calculator } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { findProgrammaticPage, getRelatedPages } from "@/src/lib/programmatic-seo";

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export function EmiPreset() {
  const { slug } = useParams<{ slug: string }>();
  const page = findProgrammaticPage(slug ?? "");

  if (!page || page.cluster !== "emi-calculator") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Page not found</p>
      </div>
    );
  }

  const related = getRelatedPages(page);
  const loanAmount = page.preset.loanAmount as number;
  const interestRate = page.preset.interestRate as number;
  const loanTerm = page.preset.loanTerm as number;
  const termType = (page.preset.termType as string) ?? "years";

  const { emi, totalPayment, totalInterest } = useMemo(() => {
    const months = termType === "years" ? loanTerm * 12 : loanTerm;
    const monthlyRate = interestRate / 100 / 12;
    let emiVal: number;
    if (monthlyRate === 0) {
      emiVal = loanAmount / months;
    } else {
      emiVal = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    }
    const totalPay = emiVal * months;
    return {
      emi: Math.round(emiVal),
      totalPayment: Math.round(totalPay),
      totalInterest: Math.round(totalPay - loanAmount),
    };
  }, [loanAmount, interestRate, loanTerm, termType]);

  return (
    <ToolLayout
      title={page.h1}
      description={page.description}
      icon={<Landmark className="h-7 w-7" />}
      toolSlug={page.slug}
      faqItems={page.faq}
      relatedGuides={[{ title: "How Loan EMI Works", path: "/guides/how-loan-emi-works" }]}
      relatedComparisons={[{ title: "Best Credit Cards", path: "/comparisons/best-credit-cards" }]}
    >
      <SEOHead
        title={page.title}
        description={page.description}
        canonical={`/tools/${page.slug}`}
        schema="WebApplication"
        appName="Loan EMI Calculator"
        faqItems={page.faq}
      />

      <div className="space-y-10">
        {/* Intro */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 text-base leading-relaxed">{page.intro}</p>
        </div>

        {/* Pre-computed result */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <h2 className="text-white text-lg font-semibold">Quick EMI Estimate</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-white tabular-nums">{fmt(emi)}</div>
            <div className="text-white/40 text-sm mt-1">per month</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">{fmt(loanAmount)}</div>
              <div className="text-xs text-white/40 mt-1">Loan Amount</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">{interestRate}%</div>
              <div className="text-xs text-white/40 mt-1">Interest Rate</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">{loanTerm} {termType}</div>
              <div className="text-xs text-white/40 mt-1">Tenure</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">{fmt(totalInterest)}</div>
              <div className="text-xs text-white/40 mt-1">Total Interest</div>
            </div>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/60 to-white/20"
              style={{ width: `${Math.round((loanAmount / totalPayment) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>Principal ({Math.round((loanAmount / totalPayment) * 100)}%)</span>
            <span>Interest ({Math.round((totalInterest / totalPayment) * 100)}%)</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <Link to="/tools/loan-emi-calculator">
            <Button className="rounded-full px-10 h-14 text-base gap-3 font-semibold">
              <Calculator className="h-5 w-5" />
              Customize in Full Calculator
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm">Change rate, tenure, and amount — see amortization schedule</p>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Calculate EMI for Other Amounts</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/tools/${r.slug}`}
                  className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <Landmark className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.h1}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/tools/loan-emi-calculator" className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">
            Open full Loan EMI Calculator →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
