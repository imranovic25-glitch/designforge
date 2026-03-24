import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const apps = [
  {
    name: "YNAB (You Need a Budget)",
    tagline: "Best for Zero-Based Budgeting",
    pricing: "$14.99/month or $99/year (34-day free trial)",
    pros: [
      "Zero-based budgeting assigns every dollar a job",
      "Real-time bank syncing with 12,000+ institutions",
      "Goal tracking with visual progress indicators",
      "Extensive free educational workshops and resources",
      "Highly active community for support and tips"
    ]
  },
  {
    name: "Mint (by Intuit)",
    tagline: "Best Free Budgeting App",
    pricing: "Free",
    pros: [
      "Automatic bank sync and transaction categorization",
      "Net worth tracking across all linked accounts",
      "Bill reminders and subscription tracking",
      "Credit score monitoring included",
      "Custom budget categories with spending alerts"
    ]
  },
  {
    name: "Goodbudget",
    tagline: "Best for Envelope Budgeting",
    pricing: "Free tier; Plus at $10/month or $80/year",
    pros: [
      "Digital envelope system for hands-on budgeters",
      "Syncs across devices for couples and families",
      "No bank linking required — manual entry for privacy",
      "Debt payoff tracking tools",
      "Simple, distraction-free interface"
    ]
  },
  {
    name: "Monarch Money",
    tagline: "Best for Couples and Families",
    pricing: "$9.99/month or $99.99/year (7-day free trial)",
    pros: [
      "Shared and individual financial views for households",
      "Beautiful, modern dashboard with customizable widgets",
      "Investment tracking alongside budgeting",
      "Collaborative goal planning for partners",
      "Reliable bank syncing powered by Plaid and MX"
    ]
  },
  {
    name: "PocketGuard",
    tagline: "Best for Simplicity",
    pricing: "Free tier; Plus at $7.99/month or $34.99/year",
    pros: [
      "'In My Pocket' feature shows how much you can safely spend",
      "Automatic categorization of transactions",
      "Bill negotiation feature to lower recurring costs",
      "Savings goals with autosave options",
      "Clean, minimal interface ideal for budgeting beginners"
    ]
  }
];

export function BestBudgetingApps() {
  return (
    <ArticleLayout
      title="Best Budgeting Apps of 2026"
      description="The top apps for tracking your spending, building a budget, and reaching your savings goals."
      category="Finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="8 min read"
      breadcrumbs={[
        { label: "Comparisons", href: "/comparisons" },
        { label: "Best Budgeting Apps" }
      ]}
    >
      <p>
        A good budgeting app doesn't just show you where your money went — it helps you make intentional decisions about where it goes next. After testing the leading options, here are our five top picks.
      </p>

      <h2>Our Top Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {apps.map((app) => (
          <div key={app.name} className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">{app.name}</h3>
                <p className="text-white/50 font-light">{app.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{app.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {app.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full px-8 h-11">Try It <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
              <Button variant="outline" className="rounded-full px-8 h-11 border-white/20 text-white hover:bg-white/10">Learn More</Button>
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
