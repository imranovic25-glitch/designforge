import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const apps = [
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
  return (
    <ArticleLayout
      title="Best Budgeting Apps of 2026"
      description="The top apps for tracking your spending, building a budget, and reaching your savings goals."
      category="Finance"
      categoryLink="/finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="10 min read"
    >
      <p>
        A good budgeting app doesn't just show you where your money went — it helps you make intentional decisions about where it goes next. After testing the leading options, here are our top 10 picks.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {apps.map((app, index) => (
          <div key={app.name} className="glass-panel rounded-3xl p-8 md:p-10 border border-amber-500/10 hover:border-amber-500/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">{index + 1}</div>
                  <img src={app.logo} alt={app.name + " logo"} className="w-14 h-14 rounded-xl bg-white p-1.5 object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{app.name}</h3>
                  <p className="text-white/50 font-light">{app.tagline}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{app.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {app.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-8 h-11 bg-amber-600 hover:bg-amber-500 text-white">
                <a href={app.url} target="_blank" rel="noopener noreferrer">Try It <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-11 border-amber-500/30 text-amber-400 hover:bg-amber-500/10">
                <a href={app.url} target="_blank" rel="noopener noreferrer">Learn More</a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <h2>What to Look for in a Budgeting App</h2>
      <p>
        The best budgeting app is the one you'll actually use consistently. Look for reliable bank connectivity, a categorization system that matches how you think about money, and a mobile app experience that makes it easy to log or check spending in the moment. Free trials are common — test before you commit to a subscription.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
