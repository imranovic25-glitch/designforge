import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";

const tools = [
  {
    name: "Bankrate Mortgage Calculator",
    tagline: "Best Comprehensive Mortgage Calculator",
    pricing: "Free",
    logo: "https://logo.clearbit.com/bankrate.com",
    url: "https://www.bankrate.com/mortgages/mortgage-calculator/",
    pros: [
      "Includes taxes, insurance, PMI, and HOA in calculations",
      "Full amortisation schedule with monthly breakdown",
      "Side-by-side loan comparison tool",
      "Refinance and affordability calculators included",
      "Trusted by millions — editorial content from finance experts",
    ],
  },
  {
    name: "NerdWallet Mortgage Calculator",
    tagline: "Best for First-Time Buyers",
    pricing: "Free",
    logo: "https://logo.clearbit.com/nerdwallet.com",
    url: "https://www.nerdwallet.com/mortgages/mortgage-calculator",
    pros: [
      "Clean interface designed for people new to mortgages",
      "Estimated monthly payment includes all housing costs",
      "Shows how much house you can afford based on income",
      "Connected to live rate comparison from multiple lenders",
      "Educational content alongside the calculator",
    ],
  },
  {
    name: "Zillow Mortgage Calculator",
    tagline: "Best for Real Estate Browsing",
    pricing: "Free",
    logo: "https://logo.clearbit.com/zillow.com",
    url: "https://www.zillow.com/mortgage-calculator/",
    pros: [
      "Integrated with Zillow property listings",
      "Auto-populates local tax rates and insurance estimates",
      "Compare loan scenarios side by side",
      "Pre-qualification from Zillow Home Loans in minutes",
      "Mobile-friendly with seamless app integration",
    ],
  },
  {
    name: "Calculator.net Mortgage Calculator",
    tagline: "Best for Detailed Amortisation",
    pricing: "Free",
    logo: "https://logo.clearbit.com/calculator.net",
    url: "https://www.calculator.net/mortgage-calculator.html",
    pros: [
      "Detailed amortisation table with annual and monthly views",
      "Extra payment calculator shows payoff acceleration",
      "Multiple mortgage types: fixed, adjustable, interest-only",
      "No account required — results are instant",
      "Clean, fast-loading, ad-supported but functional",
    ],
  },
  {
    name: "Mortgage Calculator (mortgagecalculator.org)",
    tagline: "Best Visual Payment Breakdown",
    pricing: "Free",
    logo: "https://logo.clearbit.com/mortgagecalculator.org",
    url: "https://www.mortgagecalculator.org/",
    pros: [
      "Interactive charts showing payment breakdown over time",
      "Includes property tax and homeowner's insurance",
      "Extra payment impact visualisation",
      "Rental comparison calculator",
      "Simple, no-frills interface focused on clarity",
    ],
  },
  {
    name: "Freddie Mac Mortgage Calculator",
    tagline: "Most Trusted Government-Backed Tool",
    pricing: "Free",
    logo: "https://logo.clearbit.com/freddiemac.com",
    url: "https://myhome.freddiemac.com/resources/calculators",
    pros: [
      "Backed by a US government-sponsored enterprise",
      "Straightforward and unbiased — no lender partnerships",
      "Includes affordability and rent vs buy calculators",
      "Educational resources for first-time homebuyers",
      "Reliable data with no hidden agenda",
    ],
  },
  {
    name: "DesignForge360 Mortgage Calculator",
    tagline: "Best Free Browser-Based Calculator",
    pricing: "Free — no signup required",
    logo: "",
    url: "/tools/mortgage-calculator",
    pros: [
      "Clean, fast mortgage calculator with instant results",
      "Amortisation schedule with visual breakdown",
      "100% browser-based — no data uploaded or stored",
      "Compare different loan scenarios easily",
      "Mobile-friendly and completely free",
    ],
  },
];

export function BestMortgageCalculators() {
  return (
    <ArticleLayout
      title="Best Mortgage Calculators of 2026"
      description="Compare the top mortgage calculators for estimating monthly payments, amortisation schedules, and total loan costs."
      category="Comparisons"
      categoryLink="/comparisons"
      author="DesignForge360 Editorial"
      date="April 5, 2026"
      readTime="9 min read"
    >
      <SEOHead
        title="Best Mortgage Calculators of 2026 — 7 Options Compared"
        description="Compare the best free mortgage calculators. Bankrate, NerdWallet, Zillow, and more reviewed for accuracy, features, and ease of use."
        canonical="/comparisons/best-mortgage-calculators"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-01-15"
        articleSection="Comparisons"
      />

      <p>
        A mortgage calculator helps you estimate monthly payments, understand amortisation, and compare loan scenarios before committing to one of the largest financial decisions of your life. We've tested the leading free calculators available online.
      </p>

      <h2>Our Top 7 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {tools.map((tool, index) => (
          <ComparisonCard
            key={tool.name}
            index={index}
            brandName={tool.name}
            logoUrl={tool.logo}
            title={tool.name}
            tagline={tool.tagline}
            accent="violet"
            pros={tool.pros}
            meta={[{ label: "Pricing", value: tool.pricing }]}
            primaryAction={{ label: "Try It", href: tool.url }}
            secondaryAction={{ label: "Learn More", href: tool.url }}
          />
        ))}
      </div>

      <h2>Which Calculator Should You Use?</h2>
      <p>
        For comprehensive calculations including taxes, insurance, and PMI, Bankrate is the gold standard. First-time buyers should start with NerdWallet for its educational approach. If you're already browsing listings on Zillow, their integrated calculator is most convenient. For pure amortisation detail, Calculator.net provides the deepest breakdowns.
      </p>
      <p>
        Need a quick estimate right now? Try our free <a href="/tools/mortgage-calculator">Mortgage Calculator</a>.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
