import { Fragment } from "react";
import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";
import { CountrySelector } from "@/src/components/ui/CountrySelector";
import { useCountry } from "@/src/lib/use-country";
import { getFinanceData } from "@/src/lib/finance-country-data";

// Legacy static data — superseded by geo-aware data at runtime.
const _legacyPlatforms = [
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
  const { country, setCountry, loading } = useCountry();
  const platforms = getFinanceData(country.code).investingApps;

  return (
    <ArticleLayout
      title={`Best Investing Apps of 2026 — ${country.flag} ${country.name}`}
      description="Top platforms for beginners and experienced investors looking to grow their wealth."
      category="Finance"
      categoryLink="/finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="12 min read"
    >
      <SEOHead
        title="Best Investing Apps of 2026 — Top Platforms by Country"
        description="Compare the best investment apps and stock brokers in 7 countries. Expert reviews covering fees, features, and suitability for beginners to advanced traders."
        canonical="/comparisons/best-investing-apps"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-01-01"
        articleSection="Comparisons"
      />
      {/* Country selector */}
      <div className="not-prose mb-8 flex items-center gap-3">
        <span className="text-sm text-white/40">Showing results for</span>
        <CountrySelector country={country} onChange={setCountry} />
      </div>

      <p>
        The barrier to investing has never been lower. With commission-free trading, fractional shares, and intuitive mobile apps, anyone can start building a portfolio. Here are the top investing platforms available in {country.name}.
      </p>

      <h2>Our Top Picks for {country.name}</h2>

      {loading ? (
        <div className="not-prose space-y-4 my-10">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="not-prose space-y-8 my-10">
          {platforms.map((platform, index) => (
            <Fragment key={platform.name}>
              <ComparisonCard
                index={index}
                brandName={platform.name}
                logoUrl={platform.logo}
                title={platform.name}
                tagline={platform.tagline}
                accent="indigo"
                pros={platform.pros}
                meta={[{ label: "Pricing", value: platform.pricing }]}
                primaryAction={{ label: "Open Account", href: platform.url }}
                secondaryAction={{ label: "Learn More", href: platform.url }}
              />
            </Fragment>
          ))}
        </div>
      )}

      <h2>Key Considerations</h2>
      <p>
        Before choosing an investing platform, consider your investing style (passive vs. active), what account types you need, whether you want automated management or control, and the fee structure — even small percentage fees compound significantly over time. Data is localised for {country.name}.
      </p>

      <p className="text-white/40 text-sm italic">
        This article is for informational purposes only and does not constitute investment advice. All investing involves risk. This article may contain affiliate links.
      </p>
    </ArticleLayout>
  );
}
