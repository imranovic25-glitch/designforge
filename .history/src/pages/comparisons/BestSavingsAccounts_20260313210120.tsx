import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";
import { CountrySelector } from "@/src/components/ui/CountrySelector";
import { useCountry } from "@/src/lib/use-country";
import { getFinanceData } from "@/src/lib/finance-country-data";

// Legacy static data — superseded by geo-aware data at runtime.
const _legacyAccounts = [
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
          <ComparisonCard
            key={account.name}
            index={index}
            brandName={account.name}
            title={account.name}
            tagline={account.tagline}
            accent="emerald"
            pros={account.pros}
            meta={[
              { label: "APY", value: account.apy, emphasize: true },
              { label: "Min Deposit", value: account.minDeposit },
              { label: "Monthly Fee", value: account.monthlyFee },
            ]}
            primaryAction={{ label: "Open Account", href: account.url }}
            secondaryAction={{ label: "Learn More", href: account.url }}
          />
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
