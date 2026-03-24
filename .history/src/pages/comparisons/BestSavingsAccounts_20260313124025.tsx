import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { BrandLogo } from "@/src/components/ui/brand-logo";

const accounts = [
  {
    name: "Marcus by Goldman Sachs",
    tagline: "Best Overall APY",
    apy: "4.40% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    logo: "https://logo.clearbit.com/marcus.com",
    url: "https://www.marcus.com/us/en/savings/high-yield-savings",
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
    logo: "https://logo.clearbit.com/sofi.com",
    url: "https://www.sofi.com/banking/savings-account/",
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
    logo: "https://logo.clearbit.com/ally.com",
    url: "https://www.ally.com/bank/online-savings-account/",
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
    logo: "https://logo.clearbit.com/wealthfront.com",
    url: "https://www.wealthfront.com/cash",
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
    logo: "https://logo.clearbit.com/discover.com",
    url: "https://www.discover.com/online-banking/savings-account/",
    pros: [
      "Backed by Discover — a well-established financial brand",
      "No minimum balance to earn APY",
      "FDIC insured up to $250,000",
      "24/7 US-based customer service",
      "No hidden fees or gimmicks"
    ]
  },
  {
    name: "Barclays Online Savings",
    tagline: "Best for No-Frills High Yield",
    apy: "4.35% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    logo: "https://logo.clearbit.com/barclays.co.uk",
    url: "https://www.barclays.co.uk/savings/",
    pros: [
      "Competitive APY with no minimum balance",
      "No monthly maintenance fees",
      "FDIC insured up to $250,000",
      "Straightforward, no-gimmick savings",
      "Strong global banking reputation"
    ]
  },
  {
    name: "American Express High Yield Savings",
    tagline: "Best for Amex Cardholders",
    apy: "4.00% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    logo: "https://logo.clearbit.com/americanexpress.com",
    url: "https://www.americanexpress.com/en-us/banking/online-savings/high-yield-savings/",
    pros: [
      "Seamless for existing Amex customers",
      "No minimum balance or monthly fees",
      "FDIC insured up to $250,000",
      "24/7 customer support",
      "Simple, clean online banking interface"
    ]
  },
  {
    name: "CIT Bank Platinum Savings",
    tagline: "Best Tiered Rate for Higher Balances",
    apy: "4.55% APY (with $5,000+ balance)",
    minDeposit: "$100",
    monthlyFee: "$0",
    logo: "https://logo.clearbit.com/cit.com",
    url: "https://www.cit.com/cit-bank/bank/savings/platinum-savings",
    pros: [
      "Top-tier APY for balances of $5,000+",
      "No monthly service fees",
      "FDIC insured through First Citizens Bank",
      "Mobile check deposit and online banking",
      "Ideal for large emergency funds"
    ]
  },
  {
    name: "Capital One 360 Performance Savings",
    tagline: "Best for Big-Bank Convenience",
    apy: "4.00% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    logo: "https://logo.clearbit.com/capitalone.com",
    url: "https://www.capitalone.com/bank/savings-accounts/online-performance-savings-account/",
    pros: [
      "No minimum balance or monthly fees",
      "Access to Capital One Cafés and branches",
      "FDIC insured up to $250,000",
      "Top-rated mobile app",
      "Easy savings goal tracking"
    ]
  },
  {
    name: "Synchrony High Yield Savings",
    tagline: "Best for ATM Access with High Yield",
    apy: "4.10% APY",
    minDeposit: "$0",
    monthlyFee: "$0",
    logo: "https://logo.clearbit.com/synchronybank.com",
    url: "https://www.synchrony.com/banking/high-yield-savings",
    pros: [
      "Optional ATM card for cash access",
      "No minimum balance requirement",
      "FDIC insured up to $250,000",
      "No monthly maintenance fees",
      "Perks program with discounts and cashback offers"
    ]
  }
];

export function BestSavingsAccounts() {
  return (
    <ArticleLayout
      title="Best Savings Accounts of 2026"
      description="High-yield savings accounts that are actually worth using — compared by APY, fees, and accessibility."
      category="Finance"
      categoryLink="/finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="10 min read"
    >
      <p>
        Traditional big-bank savings accounts still pay near-zero interest. High-yield savings accounts offered by online banks and credit unions typically pay significantly more. Here are the top 10 options available right now.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {accounts.map((account, index) => (
          <div key={account.name} className="glass-panel rounded-3xl p-8 md:p-10 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-6">
                <div className="relative shrink-0">
                  <div className={`absolute -top-3 -left-3 z-10 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg ${index === 0 ? 'w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-600 ring-2 ring-yellow-400/40' : 'w-8 h-8 bg-emerald-500'}`}>{index + 1}</div>
                  <div className={`rounded-2xl ${index === 0 ? 'ring-2 ring-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : ''}`}>
                    <BrandLogo src={account.logo} name={account.name} className="w-20 h-20 rounded-2xl bg-white/95 p-2 object-contain" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{account.name}</h3>
                  <p className="text-white/50 font-light">{account.tagline}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">APY: <span className="text-emerald-400 font-semibold text-base">{account.apy}</span></span>
                <span className="text-sm text-white/40">Min Deposit: <span className="text-white font-medium">{account.minDeposit}</span></span>
                <span className="text-sm text-white/40">Monthly Fee: <span className="text-white font-medium">{account.monthlyFee}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {account.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-8 h-11 bg-emerald-600 hover:bg-emerald-500 text-white">
                <a href={account.url} target="_blank" rel="noopener noreferrer">Open Account <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-11 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <a href={account.url} target="_blank" rel="noopener noreferrer">Learn More</a>
              </Button>
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
