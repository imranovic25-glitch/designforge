import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { BrandLogo } from "@/src/components/ui/brand-logo";

const cards = [
  {
    name: "Chase Freedom Unlimited®",
    issuer: "Chase",
    tagline: "Best everyday cash back card",
    annualFee: "$0",
    apr: "19.99%–28.74% Variable",
    bonus: "Earn $200 cash back after spending $500 in the first 3 months.",
    logo: "https://logo.clearbit.com/chase.com",
    applyUrl: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
    learnUrl: "https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited",
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
    logo: "https://logo.clearbit.com/citi.com",
    applyUrl: "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
    learnUrl: "https://www.citi.com/credit-cards/citi-double-cash-credit-card",
    pros: [
      "2% cash back (1% when you buy, 1% when you pay)",
      "No annual fee",
      "No category restrictions",
      "Simple, predictable rewards structure",
      "Long 0% intro APR on balance transfers"
    ]
  },
  {
    name: "Chase Sapphire Preferred®",
    issuer: "Chase",
    tagline: "Best mid-tier travel card",
    annualFee: "$95",
    apr: "21.49%–28.49% Variable",
    bonus: "Earn 60,000 bonus points after spending $4,000 in first 3 months.",
    logo: "https://logo.clearbit.com/chase.com",
    applyUrl: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
    learnUrl: "https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred",
    pros: [
      "3x points on dining including delivery",
      "2x points on all travel purchases",
      "25% more value on travel through Chase portal",
      "Transfer to 14+ airline and hotel partners",
      "Trip cancellation and interruption insurance"
    ]
  },
  {
    name: "Chase Sapphire Reserve®",
    issuer: "Chase",
    tagline: "Best premium travel card",
    annualFee: "$550",
    apr: "21.99%–28.99% Variable",
    bonus: "Earn 60,000 bonus points after spending $4,000 in first 3 months.",
    logo: "https://logo.clearbit.com/chase.com",
    applyUrl: "https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve",
    learnUrl: "https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve",
    pros: [
      "$300 annual travel credit",
      "3x points on travel and dining",
      "10x on hotels and car rentals through Chase",
      "Priority Pass airport lounge access",
      "Global Entry / TSA PreCheck credit"
    ]
  },
  {
    name: "American Express® Gold Card",
    issuer: "American Express",
    tagline: "Best for dining and groceries",
    annualFee: "$250",
    apr: "29.99% Variable",
    bonus: "Earn 60,000 Membership Rewards points after spending $6,000 in first 6 months.",
    logo: "https://logo.clearbit.com/americanexpress.com",
    applyUrl: "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
    learnUrl: "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
    pros: [
      "4x points at restaurants worldwide",
      "4x points at U.S. supermarkets (up to $25K/year)",
      "$120 dining credit (Grubhub, Cheesecake Factory, etc.)",
      "$120 Uber Cash credit annually",
      "No foreign transaction fees"
    ]
  },
  {
    name: "Capital One Venture X Rewards",
    issuer: "Capital One",
    tagline: "Best travel card for value seekers",
    annualFee: "$395",
    apr: "19.99%–29.99% Variable",
    bonus: "Earn 75,000 bonus miles after spending $4,000 in first 3 months.",
    logo: "https://logo.clearbit.com/capitalone.com",
    applyUrl: "https://www.capitalone.com/credit-cards/venture-x/",
    learnUrl: "https://www.capitalone.com/credit-cards/venture-x/",
    pros: [
      "2x miles on every purchase, 10x on hotels via Capital One Travel",
      "$300 annual travel credit through Capital One Travel",
      "10,000 bonus miles anniversary bonus each year",
      "Priority Pass and Capital One Lounge access",
      "Premium travel insurance and purchase protections"
    ]
  },
  {
    name: "Discover it® Cash Back",
    issuer: "Discover",
    tagline: "Best for rotating bonus categories",
    annualFee: "$0",
    apr: "16.99%–27.99% Variable",
    bonus: "Cashback Match — Discover matches all cash back earned in your first year.",
    logo: "https://logo.clearbit.com/discover.com",
    applyUrl: "https://www.discover.com/credit-cards/cash-back/it-card.html",
    learnUrl: "https://www.discover.com/credit-cards/cash-back/it-card.html",
    pros: [
      "5% cash back in rotating quarterly categories (up to $1,500)",
      "1% cash back on all other purchases",
      "First-year Cashback Match doubles your earnings",
      "No annual fee",
      "Free FICO® credit score on monthly statements"
    ]
  },
  {
    name: "Blue Cash Preferred® from Amex",
    issuer: "American Express",
    tagline: "Best for families and groceries",
    annualFee: "$95",
    apr: "19.24%–29.99% Variable",
    bonus: "Earn $250 after spending $3,000 in first 6 months.",
    logo: "https://logo.clearbit.com/americanexpress.com",
    applyUrl: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/",
    learnUrl: "https://www.americanexpress.com/us/credit-cards/card/blue-cash-preferred/",
    pros: [
      "6% cash back at U.S. supermarkets (up to $6,000/year)",
      "6% on select U.S. streaming subscriptions",
      "3% cash back on transit and U.S. gas stations",
      "1% on all other purchases",
      "0% intro APR for 12 months on purchases"
    ]
  },
  {
    name: "Wells Fargo Active Cash® Card",
    issuer: "Wells Fargo",
    tagline: "Best simple cash back with no gimmicks",
    annualFee: "$0",
    apr: "19.99%–29.99% Variable",
    bonus: "Earn $200 cash rewards after spending $500 in first 3 months.",
    logo: "https://logo.clearbit.com/wellsfargo.com",
    applyUrl: "https://www.wellsfargo.com/credit-cards/active-cash/",
    learnUrl: "https://www.wellsfargo.com/credit-cards/active-cash/",
    pros: [
      "Unlimited 2% cash rewards on all purchases",
      "No annual fee",
      "0% intro APR for 15 months on purchases and balance transfers",
      "Cell phone protection up to $600",
      "Access to Wells Fargo Rewards with flexible redemption"
    ]
  },
  {
    name: "Capital One SavorOne Cash Rewards",
    issuer: "Capital One",
    tagline: "Best for entertainment and dining",
    annualFee: "$0",
    apr: "19.99%–29.99% Variable",
    bonus: "Earn $200 cash back after spending $500 in first 3 months.",
    logo: "https://logo.clearbit.com/capitalone.com",
    applyUrl: "https://www.capitalone.com/credit-cards/savorone-dining-rewards/",
    learnUrl: "https://www.capitalone.com/credit-cards/savorone-dining-rewards/",
    pros: [
      "3% cash back on dining, entertainment, and popular streaming",
      "3% on grocery stores (excluding superstores)",
      "1% on all other purchases",
      "No annual fee",
      "No foreign transaction fees"
    ]
  }
];

export function BestCreditCards() {
  return (
    <ArticleLayout
      title="Best Credit Cards of 2026"
      description="We compared dozens of credit cards across categories — cash back, travel, balance transfer, and business — to find the best offers available right now."
      category="Finance"
      categoryLink="/finance"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="12 min read"
    >
      <p>
        The right credit card can earn you hundreds of dollars in rewards per year, give you travel perks worth far more than the annual fee, and provide purchase protections you didn't know you needed. The wrong one can cost you in fees and interest. We broke down the top 10 options by category to help you find the right fit.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {cards.map((card, index) => (
          <div key={card.name} className="glass-panel rounded-3xl p-8 md:p-10 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-6">
                <div className="relative shrink-0">
                  <div className={`absolute -top-3 -left-3 z-10 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg ${index === 0 ? 'w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-600 ring-2 ring-yellow-400/40' : 'w-8 h-8 bg-emerald-500'}`}>{index + 1}</div>
                  <div className={`rounded-2xl ${index === 0 ? 'ring-2 ring-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : ''}`}>
                    <BrandLogo src={card.logo} name={card.issuer} className="w-20 h-20 rounded-2xl bg-white/95 p-2 object-contain" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-400/70 uppercase tracking-widest mb-2">{card.issuer}</p>
                  <h3 className="text-2xl font-semibold text-white mb-2">{card.name}</h3>
                  <p className="text-white/50 font-light">{card.tagline}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Annual Fee: <span className="text-white font-medium">{card.annualFee}</span></span>
                <span className="text-sm text-white/40">APR: <span className="text-white/70">{card.apr}</span></span>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 mb-8">
              <p className="text-sm text-white/70 font-light"><span className="text-emerald-400 font-medium">Welcome Offer: </span>{card.bonus}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {card.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-8 h-11 bg-emerald-600 hover:bg-emerald-500 text-white">
                <a href={card.applyUrl} target="_blank" rel="noopener noreferrer">Apply Now <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-11 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                <a href={card.learnUrl} target="_blank" rel="noopener noreferrer">Learn More</a>
              </Button>
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
