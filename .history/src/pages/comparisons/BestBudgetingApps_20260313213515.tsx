import { Fragment } from "react";
import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";
import { CountrySelector } from "@/src/components/ui/CountrySelector";
import { useCountry } from "@/src/lib/use-country";
import { getFinanceData } from "@/src/lib/finance-country-data";

// Legacy static data — superseded by geo-aware data at runtime.
const _legacyApps = [
  {
    name: "YNAB (You Need a Budget)",
    tagline: "Best for Zero-Based Budgeting",
    pricing: "$14.99/month or $99/year (34-day free trial)",
    logo: "https://logo.clearbit.com/ynab.com",
    url: "https://www.ynab.com/",
    pros: [
      "Zero-based budgeting assigns every dollar a job",
      "Real-time bank syncing with 12,000+ institutions",
      "Goal tracking with visual progress indicators",
      "Extensive free educational workshops and resources",
      "Highly active community for support and tips"
    ]
  },
  {
    name: "Monarch Money",
    tagline: "Best for Couples and Families",
    pricing: "$9.99/month or $99.99/year (7-day free trial)",
    logo: "https://logo.clearbit.com/monarchmoney.com",
    url: "https://www.monarchmoney.com/",
    pros: [
      "Shared and individual financial views for households",
      "Beautiful, modern dashboard with customizable widgets",
      "Investment tracking alongside budgeting",
      "Collaborative goal planning for partners",
      "Reliable bank syncing powered by Plaid and MX"
    ]
  },
  {
    name: "Goodbudget",
    tagline: "Best for Envelope Budgeting",
    pricing: "Free tier; Plus at $10/month or $80/year",
    logo: "https://logo.clearbit.com/goodbudget.com",
    url: "https://goodbudget.com/",
    pros: [
      "Digital envelope system for hands-on budgeters",
      "Syncs across devices for couples and families",
      "No bank linking required — manual entry for privacy",
      "Debt payoff tracking tools",
      "Simple, distraction-free interface"
    ]
  },
  {
    name: "PocketGuard",
    tagline: "Best for Simplicity",
    pricing: "Free tier; Plus at $7.99/month or $34.99/year",
    logo: "https://logo.clearbit.com/pocketguard.com",
    url: "https://pocketguard.com/",
    pros: [
      "'In My Pocket' feature shows how much you can safely spend",
      "Automatic categorization of transactions",
      "Bill negotiation feature to lower recurring costs",
      "Savings goals with autosave options",
      "Clean, minimal interface ideal for budgeting beginners"
    ]
  },
  {
    name: "EveryDollar",
    tagline: "Best Free Zero-Based Budgeting App",
    pricing: "Free tier; Premium at $17.99/month or $79.99/year",
    logo: "https://logo.clearbit.com/ramseysolutions.com",
    url: "https://www.ramseysolutions.com/ramseyplus/everydollar",
    pros: [
      "Simple drag-and-drop zero-based budgeting",
      "Quick 10-minute budget setup",
      "Bank sync on premium plan",
      "Integrates with Ramsey+ financial courses",
      "Baby Steps tracker for debt payoff"
    ]
  },
  {
    name: "Simplifi by Quicken",
    tagline: "Best for Spending Insights",
    pricing: "$3.99/month or $47.88/year",
    logo: "https://logo.clearbit.com/quicken.com",
    url: "https://www.quicken.com/simplifi/",
    pros: [
      "Personalized spending plan adapts to your cash flow",
      "Automatic categorization with smart rules",
      "Savings goal tracking with progress visuals",
      "Bill and subscription reminders",
      "Clean dashboard with net worth tracking"
    ]
  },
  {
    name: "Copilot Money",
    tagline: "Best Premium App for iOS",
    pricing: "$10.99/month or $69.99/year",
    logo: "https://logo.clearbit.com/copilot.money",
    url: "https://copilot.money/",
    pros: [
      "Beautiful native iOS and Mac app design",
      "Real-time bank syncing with instant categorization",
      "Investment portfolio tracking built in",
      "Subscription and recurring bill management",
      "Smart budgets that adapt to spending trends"
    ]
  },
  {
    name: "Honeydue",
    tagline: "Best Free App for Couples",
    pricing: "Free",
    logo: "https://logo.clearbit.com/honeydue.com",
    url: "https://www.honeydue.com/",
    pros: [
      "Purpose-built for couples to manage money together",
      "Share or hide individual accounts by your choice",
      "Split bills and track shared expenses",
      "In-app chat for money conversations",
      "Monthly bill reminders and due date tracking"
    ]
  },
  {
    name: "Wally",
    tagline: "Best for International Users",
    pricing: "Free tier; Premium at $4.99/month",
    logo: "https://logo.clearbit.com/wally.me",
    url: "https://wally.me/",
    pros: [
      "Supports 100+ currencies for global users",
      "Smart receipt scanning and expense logging",
      "Joint money management for groups",
      "Net worth tracking across countries",
      "Manual and automatic bank syncing"
    ]
  },
  {
    name: "Mint (by Intuit)",
    tagline: "Best Free All-in-One Overview",
    pricing: "Free (migrated to Credit Karma)",
    logo: "https://logo.clearbit.com/creditkarma.com",
    url: "https://www.creditkarma.com/",
    pros: [
      "Automatic bank sync and transaction categorization",
      "Net worth tracking across all linked accounts",
      "Credit score monitoring included",
      "Bill tracking and reminders",
      "Custom budget categories with spending alerts"
    ]
  }
];

export function BestBudgetingApps() {
  const { country, setCountry, loading } = useCountry();
  const apps = getFinanceData(country.code).budgetingApps;

  return (
    <ArticleLayout
      title={`Best Budgeting Apps of 2026 — ${country.flag} ${country.name}`}
      description="The top apps for tracking your spending, building a budget, and reaching your savings goals."
      category="Finance"
      categoryLink="/finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="10 min read"
    >
      {/* Country selector */}
      <div className="not-prose mb-8 flex items-center gap-3">
        <span className="text-sm text-white/40">Showing results for</span>
        <CountrySelector country={country} onChange={setCountry} />
      </div>

      <p>
        A good budgeting app doesn’t just show you where your money went — it helps you make intentional decisions about where it goes next. Here are the top budgeting apps available for users in {country.name}.
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
          {apps.map((app, index) => (
            <Fragment key={app.name}>
              <ComparisonCard
                index={index}
                brandName={app.name}
                logoUrl={app.logo}
                title={app.name}
                tagline={app.tagline}
                accent="amber"
                pros={app.pros}
                meta={[{ label: "Pricing", value: app.pricing }]}
                primaryAction={{ label: "Try It", href: app.url }}
                secondaryAction={{ label: "Learn More", href: app.url }}
              />
            </Fragment>
          ))}
        </div>
      )}

      <h2>What to Look for in a Budgeting App</h2>
      <p>
        The best budgeting app is the one you’ll actually use consistently. Look for reliable bank connectivity for your local banks in {country.name}, a categorisation system that matches how you think about money, and a mobile app experience that makes it easy to log or check spending. Free trials are common — test before you commit to a subscription.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article may contain affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
