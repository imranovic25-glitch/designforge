import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const accounts = [
  {
    name: "Marcus by Goldman Sachs",
    tagline: "Best Overall APY",
    apy: "4.40% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    pros: [
      "Consistently among the highest APYs nationally",
      "No minimum deposit to open",
      "No monthly maintenance fees",
      "FDIC insured up to $250,000",
      "Easy linked external account transfers"
    ]
  },
  {
    name: "SoFi Checking & Savings",
    tagline: "Best for Full Banking Integration",
    apy: "4.20% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    pros: [
      "High APY with checking and savings in one account",
      "Up to $2 million FDIC insurance through partner banks",
      "Fee-free ATM network with 55,000+ ATMs",
      "Savings Vaults for goal-based saving",
      "Early direct deposit up to 2 days"
    ]
  },
  {
    name: "Ally Bank Online Savings",
    tagline: "Best for Everyday Savers",
    apy: "4.00% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    pros: [
      "No minimum balance requirement",
      "Savings buckets to organize goals",
      "24/7 customer support via phone, chat, and email",
      "Highly rated mobile app",
      "Surprise savings feature auto-analyzes and saves extra cash"
    ]
  },
  {
    name: "Wealthfront Cash Account",
    tagline: "Best for Large Balances",
    apy: "4.25% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    pros: [
      "Up to $8 million FDIC insurance through partner banks",
      "Seamless integration with Wealthfront investing",
      "Autopilot feature for automated money management",
      "Unlimited free transfers",
      "No fees or minimum balance requirements"
    ]
  },
  {
    name: "Discover Online Savings",
    tagline: "Best for Trusted Brand with Strong Rates",
    apy: "4.10% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    pros: [
      "Backed by Discover — a well-established financial brand",
      "No minimum balance to earn APY",
      "FDIC insured up to $250,000",
      "24/7 US-based customer service",
      "No hidden fees or gimmicks"
    ]
  }
];

export function BestSavingsAccounts() {
  return (
    <ArticleLayout
      title="Best Savings Accounts of 2026"
      description="High-yield savings accounts that are actually worth using — compared by APY, fees, and accessibility."
      category="Finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="8 min read"
      breadcrumbs={[
        { label: "Comparisons", href: "/comparisons" },
        { label: "Best Savings Accounts" }
      ]}
    >
      <p>
        Traditional big-bank savings accounts still pay near-zero interest. High-yield savings accounts offered by online banks and credit unions typically pay significantly more. Here are the five best options available right now.
      </p>

      <h2>Our Top Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {accounts.map((account) => (
          <div key={account.name} className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">{account.name}</h3>
                <p className="text-white/50 font-light">{account.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">APY: <span className="text-green-400 font-semibold text-base">{account.apy}</span></span>
                <span className="text-sm text-white/40">Min Deposit: <span className="text-white font-medium">{account.minDeposit}</span></span>
                <span className="text-sm text-white/40">Monthly Fee: <span className="text-white font-medium">{account.monthlyFee}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {account.pros.map((pro) => (
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

      <h2>What to Look for in a Savings Account</h2>
      <p>
        APY is the most important factor, but also compare minimum balance requirements, transfer times (some accounts take 2–3 business days to transfer out), FDIC insurance coverage, and whether the rate is a promotional introductory rate or a steady ongoing yield.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: APY rates are accurate as of the publish date and may change. This article contains affiliate links. We may earn a commission if you open an account through our links.
      </p>
    </ArticleLayout>
  );
}
