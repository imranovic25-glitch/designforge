import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const cards = [
  {
    name: "Chase Freedom Unlimited®",
    issuer: "Chase",
    tagline: "Best everyday cash back card",
    annualFee: "$0",
    apr: "19.99%–28.74% Variable",
    bonus: "Earn $200 cash back after spending $500 in the first 3 months.",
    pros: [
      "1.5% cash back on all purchases",
      "5% on travel through Chase Ultimate Rewards",
      "3% on dining and drugstores",
      "No annual fee",
      "0% intro APR for 15 months"
    ]
  },
  {
    name: "Citi Double Cash® Card",
    issuer: "Citi",
    tagline: "Best flat-rate cash back",
    annualFee: "$0",
    apr: "18.99%–28.99% Variable",
    bonus: "Earn $200 cash back after $1,500 in purchases in first 6 months.",
    pros: [
      "2% cash back (1% when you buy, 1% when you pay)",
      "No annual fee",
      "No category restrictions",
      "Simple, predictable rewards structure",
      "Long 0% intro APR on balance transfers"
    ]
  },
  {
    name: "Chase Sapphire Reserve®",
    issuer: "Chase",
    tagline: "Best premium travel card",
    annualFee: "$550",
    apr: "21.99%–28.99% Variable",
    bonus: "Earn 60,000 bonus points after spending $4,000 in first 3 months.",
    pros: [
      "$300 annual travel credit",
      "3x points on travel and dining",
      "10x on hotels and car rentals through Chase",
      "Priority Pass airport lounge access",
      "Global Entry / TSA PreCheck credit"
    ]
  }
];

export function BestCreditCards() {
  return (
    <ArticleLayout
      title="Best Credit Cards of 2026"
      description="We compared dozens of credit cards across categories — cash back, travel, balance transfer, and business — to find the best offers available right now."
      category="Finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="10 min read"
      breadcrumbs={[
        { label: "Comparisons", href: "/comparisons" },
        { label: "Best Credit Cards" }
      ]}
    >
      <p>
        The right credit card can earn you hundreds of dollars in rewards per year, give you travel perks worth far more than the annual fee, and provide purchase protections you didn't know you needed. The wrong one can cost you in fees and interest. We broke down the top options by category to help you find the right fit.
      </p>

      <h2>Our Top Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {cards.map((card) => (
          <div key={card.name} className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">{card.issuer}</p>
                <h3 className="text-2xl font-semibold text-white mb-2">{card.name}</h3>
                <p className="text-white/50 font-light">{card.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Annual Fee: <span className="text-white font-medium">{card.annualFee}</span></span>
                <span className="text-sm text-white/40">APR: <span className="text-white/70">{card.apr}</span></span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-5 mb-8">
              <p className="text-sm text-white/70 font-light"><span className="text-white font-medium">Welcome Offer: </span>{card.bonus}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {card.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full px-8 h-11">Apply Now <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
              <Button variant="outline" className="rounded-full px-8 h-11 border-white/20 text-white hover:bg-white/10">Learn More</Button>
            </div>
          </div>
        ))}
      </div>

      <h2>How We Chose These Cards</h2>
      <p>
        We evaluated cards on annual fees versus ongoing value, sign-up bonus attainability, reward earn rates on common spending categories, APR ranges, additional benefits (travel credits, insurance, lounge access), and customer service reputation.
      </p>

      <h2>How to Choose the Right Card for You</h2>
      <p>
        Start by identifying your primary spending categories and your goal — whether that's cash back simplicity, maximizing travel rewards, or paying down existing debt with a balance transfer offer. Then match those priorities to the relevant card features. A card with a high annual fee is only worth it if you actually use enough of the benefits to offset the cost.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you apply for and are approved for a card through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
