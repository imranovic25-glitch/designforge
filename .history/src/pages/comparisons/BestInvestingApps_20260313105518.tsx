import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const platforms = [
  {
    name: "Fidelity Investments",
    tagline: "Best Overall Investing Platform",
    pricing: "$0 commission on stocks and ETFs",
    pros: [
      "Zero commission on stocks, ETFs, and options",
      "Fractional shares starting at $1",
      "No account minimums for brokerage or IRA accounts",
      "Excellent research tools and educational resources",
      "Highly rated mobile app and desktop platform"
    ]
  },
  {
    name: "Robinhood",
    tagline: "Best for Beginners",
    pricing: "$0 commission; Gold at $5/month",
    pros: [
      "Clean, beginner-friendly interface",
      "Fractional shares starting at $1",
      "IRA with 1% match on contributions",
      "Instant deposits up to $1,000",
      "Crypto trading available alongside stocks"
    ]
  },
  {
    name: "Charles Schwab",
    tagline: "Best for Full-Service Investing",
    pricing: "$0 commission on stocks and ETFs",
    pros: [
      "Comprehensive research from Schwab and Morningstar",
      "Thinkorswim platform for advanced traders",
      "No account minimums",
      "Wide range of account types including trusts and custodial",
      "24/7 customer support and 300+ physical branches"
    ]
  },
  {
    name: "Betterment",
    tagline: "Best Robo-Advisor for Hands-Off Investing",
    pricing: "0.25% annual fee (Digital); 0.40% (Premium)",
    pros: [
      "Automated portfolio management with rebalancing",
      "Tax-loss harvesting on all taxable accounts",
      "Goal-based investing with retirement projections",
      "Socially responsible investing portfolios available",
      "No minimum balance for the Digital plan"
    ]
  },
  {
    name: "Webull",
    tagline: "Best for Active and Technical Traders",
    pricing: "$0 commission; free advanced charting",
    pros: [
      "Advanced charting with 50+ technical indicators",
      "Extended hours trading (4 AM – 8 PM ET)",
      "Paper trading for risk-free practice",
      "Options and crypto trading included",
      "Real-time market data with no subscription required"
    ]
  }
];

export function BestInvestingApps() {
  return (
    <ArticleLayout
      title="Best Investing Apps of 2026"
      description="Top platforms for beginners and experienced investors looking to grow their wealth."
      category="Finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="9 min read"
      breadcrumbs={[
        { label: "Comparisons", href: "/comparisons" },
        { label: "Best Investing Apps" }
      ]}
    >
      <p>
        The barrier to investing has never been lower. With commission-free trading, fractional shares, and intuitive mobile apps, anyone with a few dollars to spare can start building a portfolio. Here's how the top five platforms compare.
      </p>

      <h2>Our Top Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {platforms.map((platform) => (
          <div key={platform.name} className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">{platform.name}</h3>
                <p className="text-white/50 font-light">{platform.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{platform.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {platform.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full px-8 h-11">Open Account <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
              <Button variant="outline" className="rounded-full px-8 h-11 border-white/20 text-white hover:bg-white/10">Learn More</Button>
            </div>
          </div>
        ))}
      </div>

      <h2>Key Considerations</h2>
      <p>
        Before choosing an investing platform, consider your investing style (passive vs. active), what account types you need (taxable, IRA, Roth IRA), whether you want automated management or control, and the fee structure — even small percentage fees compound significantly over decades.
      </p>

      <p className="text-white/40 text-sm italic">
        This article is for informational purposes only and does not constitute investment advice. All investing involves risk. This article may contain affiliate links.
      </p>
    </ArticleLayout>
  );
}
