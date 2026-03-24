import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const platforms = [
  {
    name: "Fidelity Investments",
    tagline: "Best Overall Investing Platform",
    pricing: "$0 commission on stocks and ETFs",
    logo: "https://logo.clearbit.com/fidelity.com",
    url: "https://www.fidelity.com/",
    pros: [
      "Zero commission on stocks, ETFs, and options",
      "Fractional shares starting at $1",
      "No account minimums for brokerage or IRA accounts",
      "Excellent research tools and educational resources",
      "Highly rated mobile app and desktop platform"
    ]
  },
  {
    name: "Charles Schwab",
    tagline: "Best for Full-Service Investing",
    pricing: "$0 commission on stocks and ETFs",
    logo: "https://logo.clearbit.com/schwab.com",
    url: "https://www.schwab.com/",
    pros: [
      "Comprehensive research from Schwab and Morningstar",
      "Thinkorswim platform for advanced traders",
      "No account minimums",
      "Wide range of account types including trusts and custodial",
      "24/7 customer support and 300+ physical branches"
    ]
  },
  {
    name: "Robinhood",
    tagline: "Best for Beginners",
    pricing: "$0 commission; Gold at $5/month",
    logo: "https://logo.clearbit.com/robinhood.com",
    url: "https://robinhood.com/",
    pros: [
      "Clean, beginner-friendly interface",
      "Fractional shares starting at $1",
      "IRA with 1% match on contributions",
      "Instant deposits up to $1,000",
      "Crypto trading available alongside stocks"
    ]
  },
  {
    name: "Vanguard",
    tagline: "Best for Long-Term Index Investing",
    pricing: "$0 commission on Vanguard ETFs and stocks",
    logo: "https://logo.clearbit.com/vanguard.com",
    url: "https://investor.vanguard.com/",
    pros: [
      "Pioneer of low-cost index fund investing",
      "Lowest expense ratios in the industry",
      "Owned by fund shareholders — no outside owners",
      "Excellent retirement planning tools",
      "Personal Advisor Services for guided investing"
    ]
  },
  {
    name: "Betterment",
    tagline: "Best Robo-Advisor for Hands-Off Investing",
    pricing: "0.25% annual fee (Digital); 0.40% (Premium)",
    logo: "https://logo.clearbit.com/betterment.com",
    url: "https://www.betterment.com/",
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
    logo: "https://logo.clearbit.com/webull.com",
    url: "https://www.webull.com/",
    pros: [
      "Advanced charting with 50+ technical indicators",
      "Extended hours trading (4 AM – 8 PM ET)",
      "Paper trading for risk-free practice",
      "Options and crypto trading included",
      "Real-time market data with no subscription required"
    ]
  },
  {
    name: "E*TRADE (Morgan Stanley)",
    tagline: "Best for Options Trading",
    pricing: "$0 commission on stocks; $0.65/options contract",
    logo: "https://logo.clearbit.com/etrade.com",
    url: "https://us.etrade.com/",
    pros: [
      "Power E*TRADE platform for advanced options analysis",
      "Pre-built options strategies and screeners",
      "Extensive educational content for all levels",
      "No account minimums for brokerage accounts",
      "Backed by Morgan Stanley's research and resources"
    ]
  },
  {
    name: "Wealthfront",
    tagline: "Best Robo-Advisor for Tech-Savvy Investors",
    pricing: "0.25% annual advisory fee",
    logo: "https://logo.clearbit.com/wealthfront.com",
    url: "https://www.wealthfront.com/",
    pros: [
      "Automated investing with daily tax-loss harvesting",
      "Direct indexing available for accounts over $100K",
      "High-yield cash account with 4.25% APY",
      "Free financial planning tools",
      "Portfolio line of credit at low rates"
    ]
  },
  {
    name: "SoFi Invest",
    tagline: "Best for All-in-One Financial Platform",
    pricing: "$0 commission; no account minimums",
    logo: "https://logo.clearbit.com/sofi.com",
    url: "https://www.sofi.com/invest/",
    pros: [
      "Stocks, ETFs, and crypto in one account",
      "Fractional shares starting at $5",
      "Free access to certified financial planners",
      "Auto-invest robo-advisor portfolio option",
      "Integrated with SoFi banking and lending products"
    ]
  },
  {
    name: "Acorns",
    tagline: "Best for Micro-Investing Beginners",
    pricing: "$3/month (Personal); $5/month (Family)",
    logo: "https://logo.clearbit.com/acorns.com",
    url: "https://www.acorns.com/",
    pros: [
      "Round-up spare change from everyday purchases to invest",
      "Set-it-and-forget-it automated investing",
      "Retirement accounts (IRA) included in all plans",
      "Found Money — earn bonus investments from partner brands",
      "Family plan includes custodial accounts for kids"
    ]
  }
];

export function BestInvestingApps() {
  return (
    <ArticleLayout
      title="Best Investing Apps of 2026"
      description="Top platforms for beginners and experienced investors looking to grow their wealth."
      category="Finance"
      categoryLink="/finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="12 min read"
    >
      <p>
        The barrier to investing has never been lower. With commission-free trading, fractional shares, and intuitive mobile apps, anyone with a few dollars to spare can start building a portfolio. Here's how the top 10 platforms compare.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {platforms.map((platform, index) => (
          <div key={platform.name} className="glass-panel rounded-3xl p-8 md:p-10 border border-indigo-500/10 hover:border-indigo-500/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">{index + 1}</div>
                  <img src={platform.logo} alt={platform.name + " logo"} className="w-14 h-14 rounded-xl bg-white p-1.5 object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{platform.name}</h3>
                  <p className="text-white/50 font-light">{platform.tagline}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{platform.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {platform.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-8 h-11 bg-indigo-600 hover:bg-indigo-500 text-white">
                <a href={platform.url} target="_blank" rel="noopener noreferrer">Open Account <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-11 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
                <a href={platform.url} target="_blank" rel="noopener noreferrer">Learn More</a>
              </Button>
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
