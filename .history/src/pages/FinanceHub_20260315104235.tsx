import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeftRight, CreditCard, Landmark, TrendingUp, PieChart, ShieldCheck, Home } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/src/components/ui/button";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
import { CountrySelector } from "@/src/components/ui/CountrySelector";
import { useCountry } from "@/src/lib/use-country";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function FinanceHub() {
  const { country, setCountry } = useCountry();
  return (
    <div className="min-h-screen pt-32 pb-24 selection:bg-emerald-300/30 selection:text-white">
      <SEOHead
        title="Financial Calculators & Best Finance Products by Country"
        description="Compound interest calculator, loan EMI calculator, currency converter, and expert-reviewed credit cards, savings accounts, and investing apps by country."
        canonical="/finance"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        {/* Finance Hero */}
        <RevealOnScroll className="mb-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16">
            {/* Left: text */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium uppercase tracking-widest mb-8">
                <TrendingUp className="h-3.5 w-3.5" /> Finance Hub
              </div>
              {/* Country indicator */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm text-white/40">Showing finance data for</span>
                <CountrySelector country={country} onChange={setCountry} />
              </div>
              <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
                Financial tools and insights for <span className="text-emerald-400">smarter decisions</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed mb-12 max-w-2xl">
                Calculate, compare, and understand money through focused tools, practical comparisons, and clear guides.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button size="lg" asChild className="h-14 px-8 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 text-base font-medium transition-all duration-300">
                  <a href="#calculators">Explore Finance Tools</a>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-14 px-8 rounded-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-base font-medium transition-all duration-300">
                  <a href="#comparisons">View Finance Comparisons</a>
                </Button>
              </div>
            </div>

            {/* Right: animated finance visual */}
            <div className="flex-1 relative mt-16 lg:mt-0 hidden lg:block">
              <div className="relative h-[420px]">
                {/* Portfolio card */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-0 right-0 w-72 bg-[#0d1f16] border border-emerald-500/20 rounded-2xl p-6 shadow-[0_8px_40px_rgba(16,185,129,0.12)]"
                >
                  <div className="text-xs text-emerald-400/60 uppercase tracking-widest mb-3">Portfolio Value</div>
                  <div className="text-3xl font-bold text-white mb-1">$84,250</div>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-4">
                    <TrendingUp className="h-4 w-4" /> +12.4% this year
                  </div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1 h-12">
                    {[35, 55, 42, 68, 52, 78, 64, 85, 72, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-emerald-500/20 group-hover:bg-emerald-500/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </motion.div>

                {/* Credit card */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  className="absolute top-36 left-0 w-64 bg-gradient-to-br from-emerald-900/80 to-emerald-800/40 border border-emerald-500/20 rounded-2xl p-6 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex justify-between items-start mb-6">
                    <CreditCard className="h-8 w-8 text-emerald-400" />
                    <div className="text-xs text-emerald-400/60 uppercase tracking-widest">Rewards</div>
                  </div>
                  <div className="text-lg font-mono text-white/70 mb-2">•••• •••• •••• 4821</div>
                  <div className="text-xs text-white/40">Best card for {country.name}</div>
                </motion.div>

                {/* Savings rate card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                  className="absolute bottom-0 right-8 w-60 bg-[#111] border border-emerald-500/10 rounded-2xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                >
                  <div className="text-xs text-white/40 mb-2">High-Yield Savings</div>
                  <div className="text-2xl font-bold text-emerald-400 mb-1">5.10% APY</div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/60" />
                    <span className="text-xs text-white/40">FDIC / Govt insured</span>
                  </div>
                </motion.div>

                {/* Glow */}
                <div className="absolute inset-0 bg-emerald-500/5 rounded-[40px] blur-3xl pointer-events-none" />
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Featured Finance Tools */}
        <section id="calculators" className="mb-32 scroll-mt-32">
          <div className="flex items-center justify-between mb-12 border-b border-emerald-500/10 pb-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Calculators</h2>
            <Link to="/tools" className="text-sm font-medium text-emerald-400/60 hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">
              All Tools <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RevealOnScroll delay={0}>
            <Link to="/tools/compound-interest-calculator" className="group glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400/70 w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">Compound Interest</h3>
              <p className="text-white/50 font-light leading-relaxed">Calculate the future value of your investments with regular contributions.</p>
            </Link>
            </RevealOnScroll>
            <RevealOnScroll delay={0.07}>
            <Link to="/tools/loan-emi-calculator" className="group glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400/70 w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                <Landmark className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">Loan / EMI Calculator</h3>
              <p className="text-white/50 font-light leading-relaxed">Plan your borrowing by calculating monthly payments and total interest.</p>
            </Link>
            </RevealOnScroll>
            <RevealOnScroll delay={0.14}>
            <Link to="/tools/currency-converter" className="group glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400/70 w-16 h-16 flex items-center justify-center mb-8 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                <ArrowLeftRight className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">Currency Converter</h3>
              <p className="text-white/50 font-light leading-relaxed">Convert between global currencies with up-to-date exchange rates.</p>
            </Link>
            </RevealOnScroll>
          </div>
        </section>

        {/* Finance Comparisons */}
        <section id="comparisons" className="mb-32 scroll-mt-32">
          <div className="flex items-center justify-between mb-12 border-b border-emerald-500/10 pb-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Comparisons</h2>
            <Link to="/comparisons" className="text-sm font-medium text-emerald-400/60 hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">
              All Comparisons <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/finance/comparisons/best-credit-cards" className="group flex flex-col sm:flex-row gap-8 glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 rounded-2xl w-full sm:w-32 h-32 flex items-center justify-center shrink-0">
                <CreditCard className="h-10 w-10 text-emerald-400/40 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-medium text-white mb-3">Best Credit Cards</h3>
                <p className="text-white/50 font-light leading-relaxed mb-6">Compare top cards for rewards, travel, and cash back to maximize your spending.</p>
                <span className="text-sm font-medium text-emerald-400/60 group-hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">Read Comparison <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
            <Link to="/finance/comparisons/best-budgeting-apps" className="group flex flex-col sm:flex-row gap-8 glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 rounded-2xl w-full sm:w-32 h-32 flex items-center justify-center shrink-0">
                <PieChart className="h-10 w-10 text-emerald-400/40 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-medium text-white mb-3">Best Budgeting Apps</h3>
                <p className="text-white/50 font-light leading-relaxed mb-6">Top tools to track spending, manage your money, and reach your financial goals.</p>
                <span className="text-sm font-medium text-emerald-400/60 group-hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">Read Comparison <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
            <Link to="/finance/comparisons/best-investing-apps" className="group flex flex-col sm:flex-row gap-8 glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 rounded-2xl w-full sm:w-32 h-32 flex items-center justify-center shrink-0">
                <TrendingUp className="h-10 w-10 text-emerald-400/40 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-medium text-white mb-3">Best Investing Apps</h3>
                <p className="text-white/50 font-light leading-relaxed mb-6">Platforms for beginners and advanced traders looking to build wealth.</p>
                <span className="text-sm font-medium text-emerald-400/60 group-hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">Read Comparison <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
            <Link to="/finance/comparisons/best-savings-accounts" className="group flex flex-col sm:flex-row gap-8 glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <div className="bg-emerald-500/10 rounded-2xl w-full sm:w-32 h-32 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-10 w-10 text-emerald-400/40 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-2xl font-medium text-white mb-3">Best Savings Accounts</h3>
                <p className="text-white/50 font-light leading-relaxed mb-6">High-yield options to keep your emergency fund safe and growing.</p>
                <span className="text-sm font-medium text-emerald-400/60 group-hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">Read Comparison <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </div>
        </section>

        {/* Finance Guides */}
        <section id="guides" className="mb-32 scroll-mt-32">
          <div className="flex items-center justify-between mb-12 border-b border-emerald-500/10 pb-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">Guides</h2>
            <Link to="/guides" className="text-sm font-medium text-emerald-400/60 hover:text-emerald-400 flex items-center uppercase tracking-widest transition-colors">
              All Guides <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <RevealOnScroll delay={0}>
            <Link to="/finance/guides/compound-interest-explained" className="group block glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <h3 className="text-xl font-medium text-white mb-4 group-hover:text-emerald-300 transition-colors">Compound Interest Explained</h3>
              <p className="text-white/50 font-light leading-relaxed">How your money makes money over time, and why starting early matters.</p>
            </Link>
            </RevealOnScroll>
            <RevealOnScroll delay={0.07}>
            <Link to="/finance/guides/how-loan-emi-works" className="group block glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <h3 className="text-xl font-medium text-white mb-4 group-hover:text-emerald-300 transition-colors">How Loan EMI Works</h3>
              <p className="text-white/50 font-light leading-relaxed">Understanding principal, interest, and the math behind amortization.</p>
            </Link>
            </RevealOnScroll>
            <RevealOnScroll delay={0.14}>
            <Link to="/finance/guides/how-currency-conversion-works" className="group block glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <h3 className="text-xl font-medium text-white mb-4 group-hover:text-emerald-300 transition-colors">How Currency Conversion Works</h3>
              <p className="text-white/50 font-light leading-relaxed">Understanding exchange rates, spreads, and hidden transaction fees.</p>
            </Link>
            </RevealOnScroll>
            <RevealOnScroll delay={0.21}>
            <Link to="/finance/guides/how-to-compare-credit-cards" className="group block glass-panel rounded-3xl p-8 hover:-translate-y-2 hover:bg-emerald-500/[0.03] hover:border-emerald-500/20 transition-all duration-500">
              <h3 className="text-xl font-medium text-white mb-4 group-hover:text-emerald-300 transition-colors">How to Compare Credit Cards</h3>
              <p className="text-white/50 font-light leading-relaxed">What to look for when choosing your next card, from APR to rewards.</p>
            </Link>
            </RevealOnScroll>
          </div>
        </section>

        {/* Disclaimer */}
        <RevealOnScroll>
        <section className="glass-panel rounded-3xl p-10 md:p-16 text-center max-w-4xl mx-auto border-emerald-500/10">
          <h3 className="text-sm font-medium text-emerald-400/60 mb-6 uppercase tracking-widest">Educational Purpose Only</h3>
          <p className="text-lg text-white/50 font-light leading-relaxed">
            The content, tools, and comparisons provided on the DesignForge360 Finance Hub are for informational and educational purposes only. They do not constitute financial, investment, or legal advice. Always consult with a qualified financial advisor before making significant financial decisions.
          </p>
        </section>
        </RevealOnScroll>
      </div>
    </div>
  );
}
