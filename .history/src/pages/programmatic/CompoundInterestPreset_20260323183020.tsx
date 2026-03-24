import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { TrendingUp, ArrowRight, Calculator } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { findProgrammaticPage, getRelatedPages } from "@/src/lib/programmatic-seo";

const fmt = (val: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

export function CompoundInterestPreset() {
  const { pathname } = useLocation();
  const slug = pathname.split("/").pop() ?? "";
  const page = findProgrammaticPage(slug);

  if (!page || page.cluster !== "compound-interest") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Page not found</p>
      </div>
    );
  }

  const related = getRelatedPages(page);
  const principal = (page.preset.principal as number) ?? 0;
  const monthly = (page.preset.monthlyContribution as number) ?? 0;
  const years = (page.preset.years as number) ?? 20;
  const rate = (page.preset.annualRate as number) ?? 12;

  const { finalValue, totalContributions, totalInterest, milestones } = useMemo(() => {
    const periodsPerYear = 12;
    const ratePerPeriod = rate / 100 / periodsPerYear;
    let balance = principal;
    const ms: { year: number; value: number }[] = [];

    for (let year = 1; year <= years; year++) {
      for (let p = 0; p < periodsPerYear; p++) {
        balance = (balance + monthly) * (1 + ratePerPeriod);
      }
      if (year === 5 || year === 10 || year === 15 || year === 20 || year === 25 || year === 30 || year === years) {
        ms.push({ year, value: Math.round(balance) });
      }
    }

    const totalContrib = principal + monthly * 12 * years;
    return {
      finalValue: Math.round(balance),
      totalContributions: Math.round(totalContrib),
      totalInterest: Math.round(balance - totalContrib),
      milestones: ms.filter((m, i, arr) => arr.findIndex((x) => x.year === m.year) === i),
    };
  }, [principal, monthly, years, rate]);

  return (
    <ToolLayout
      title={page.h1}
      description={page.description}
      icon={<TrendingUp className="h-7 w-7" />}
      toolSlug={page.slug}
      faqItems={page.faq}
      relatedGuides={[{ title: "Compound Interest Explained", path: "/guides/compound-interest-explained" }]}
      relatedComparisons={[{ title: "Best Investing Apps", path: "/comparisons/best-investing-apps" }]}
    >
      <SEOHead
        title={page.title}
        description={page.description}
        canonical={`/tools/${page.slug}`}
        schema="WebApplication"
        appName="Compound Interest Calculator"
        faqItems={page.faq}
        howToSteps={[
          { name: "Open Compound Interest Calculator", text: "Click the button to launch the calculator with pre-filled values." },
          { name: "Enter initial investment", text: `Set your starting principal amount (pre-filled at ${new Intl.NumberFormat('en-IN').format(principal)}).` },
          { name: "Set monthly contribution and rate", text: `Adjust monthly SIP amount (${new Intl.NumberFormat('en-IN').format(monthly)}) and expected annual return (${rate}%).` },
          { name: "Choose investment period", text: `Set the number of years (${years}) to see how your investment grows over time.` },
          { name: "View projected growth", text: "See your final corpus, total contributions, and compounded interest earned." },
        ]}
      />

      <div className="space-y-10">
        {/* Intro */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 text-base leading-relaxed">{page.intro}</p>
        </div>

        {/* Pre-computed results */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <h2 className="text-white text-lg font-semibold">Projected Returns</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-white tabular-nums">{fmt(finalValue)}</div>
            <div className="text-white/40 text-sm mt-1">after {years} years at {rate}% annual return</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">{fmt(totalContributions)}</div>
              <div className="text-xs text-white/40 mt-1">Your Investment</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-400 tabular-nums">{fmt(totalInterest)}</div>
              <div className="text-xs text-white/40 mt-1">Growth from Compounding</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">{((finalValue / totalContributions) * 100 - 100).toFixed(0)}%</div>
              <div className="text-xs text-white/40 mt-1">Total Return</div>
            </div>
          </div>

          {/* Visual bar */}
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-white/50 to-green-400/60"
              style={{ width: `${Math.min(Math.round((totalContributions / finalValue) * 100), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/30">
            <span>Your money ({Math.round((totalContributions / finalValue) * 100)}%)</span>
            <span>Compound growth ({Math.round((totalInterest / finalValue) * 100)}%)</span>
          </div>
        </div>

        {/* Milestones */}
        {milestones.length > 1 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Growth Milestones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {milestones.map((m) => (
                <div key={m.year} className="glass-panel rounded-xl p-4 text-center">
                  <div className="text-white/40 text-xs mb-1">Year {m.year}</div>
                  <div className="text-white font-semibold tabular-nums">{fmt(m.value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <Link to="/tools/compound-interest-calculator">
            <Button className="rounded-full px-10 h-14 text-base gap-3 font-semibold">
              <Calculator className="h-5 w-5" />
              Customize in Full Calculator
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm">Adjust rate, amount, and duration — see interactive growth chart</p>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Related Calculations</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/tools/${r.slug}`}
                  className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <TrendingUp className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.h1}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/tools/compound-interest-calculator" className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">
            Open full Compound Interest Calculator →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
