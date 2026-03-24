import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, FileText, Calculator, CreditCard, TrendingUp, ArrowUpRight, PenTool, PiggyBank } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { motion } from "motion/react";

export function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-white/30 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-40 pb-32 lg:pt-52 lg:pb-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        
        {/* Subtle glowing orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent blur-[100px] rounded-full"></div>
        </div>
        
        <div className="container relative mx-auto px-6 lg:px-12 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-white/80 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-white mr-2 animate-pulse"></span>
              DesignForge 2.0 is now live
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[84px] font-semibold tracking-tighter text-white leading-[1.05] mb-8">
              The infrastructure for <br className="hidden md:block" />
              <span className="premium-gradient-text">smarter digital work.</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="mt-6 text-xl md:text-2xl text-white/50 max-w-3xl mx-auto leading-relaxed font-light">
              Enterprise-grade tools, financial calculators, and editorial insights designed to elevate your workflow and decision-making.
            </motion.p>
            
            <motion.div variants={itemVariants} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/tools" 
                className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-black bg-white rounded-full overflow-hidden transition-transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center">
                  Explore Platform <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                to="/finance" 
                className="group inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
              >
                Visit Finance Hub
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap justify-center gap-8 md:gap-20 opacity-60 grayscale">
            <div className="text-xl font-bold tracking-tighter">ACME CORP</div>
            <div className="text-xl font-bold tracking-tighter">GLOBAL TECH</div>
            <div className="text-xl font-bold tracking-tighter">NEXUS</div>
            <div className="text-xl font-bold tracking-tighter">QUANTUM</div>
            <div className="text-xl font-bold tracking-tighter">STRATOS</div>
          </div>
        </div>
      </section>

      {/* Core Tools Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">Core Utilities</h2>
            <p className="text-xl text-white/50 max-w-2xl font-light">High-performance tools engineered to solve specific problems with zero friction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/tools/background-remover" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">Background Remover</h3>
              <p className="text-white/50 leading-relaxed mb-8">Isolate subjects instantly with our precision AI model. Perfect for product photography.</p>
              <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link to="/tools/pdf-compressor" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">PDF Compressor</h3>
              <p className="text-white/50 leading-relaxed mb-8">Reduce file sizes dramatically while maintaining pixel-perfect readability.</p>
              <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link to="/tools/pdf-merger" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">PDF Merger</h3>
              <p className="text-white/50 leading-relaxed mb-8">Combine multiple documents into a single, cohesive file securely and instantly.</p>
              <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link to="/tools/currency-converter" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">Currency Converter</h3>
              <p className="text-white/50 leading-relaxed mb-8">Real-time global exchange rates with mid-market accuracy.</p>
              <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link to="/tools/compound-interest-calculator" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">Compound Interest</h3>
              <p className="text-white/50 leading-relaxed mb-8">Model your financial future with advanced contribution and growth visualizations.</p>
              <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </Link>

            <Link to="/tools/loan-emi-calculator" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3">Loan Calculator</h3>
              <p className="text-white/50 leading-relaxed mb-8">Deconstruct your borrowing costs with precise amortization schedules.</p>
              <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-32 border-t border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">Insights & Analysis</h2>
              <p className="text-xl text-white/50 font-light">Deep dives and definitive comparisons to guide your strategic decisions.</p>
            </div>
            <Link to="/comparisons" className="inline-flex items-center text-sm font-medium text-white hover:text-white/80 transition-colors">
              View all research <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/comparisons/best-credit-cards" className="group block">
              <div className="glass-panel rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col">
                <div className="h-64 bg-white/[0.02] border-b border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                  <CreditCard className="h-20 w-20 text-white/20 group-hover:text-white/40 transition-colors duration-500 group-hover:scale-110" />
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <div className="text-xs font-medium text-white/40 mb-4 tracking-widest uppercase">Finance Report</div>
                  <h3 className="text-3xl font-medium text-white mb-4">The Definitive Guide to Premium Credit Cards</h3>
                  <p className="text-white/50 mb-8 flex-1 text-lg font-light leading-relaxed">An exhaustive analysis of rewards, travel perks, and hidden benefits across the top-tier financial products of 2026.</p>
                  <span className="text-sm font-medium text-white flex items-center">Read Analysis <ArrowUpRight className="ml-1 h-4 w-4" /></span>
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-8">
              <Link to="/comparisons/best-ai-writing-tools" className="group block flex-1">
                <div className="glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col justify-center">
                  <div className="text-xs font-medium text-white/40 mb-3 tracking-widest uppercase">Productivity</div>
                  <h3 className="text-2xl font-medium text-white mb-3">Evaluating AI Writing Assistants</h3>
                  <p className="text-white/50 mb-6 font-light">Which models actually improve output quality versus just generating noise.</p>
                  <span className="text-sm font-medium text-white flex items-center mt-auto">Read Analysis <ArrowUpRight className="ml-1 h-4 w-4" /></span>
                </div>
              </Link>
              
              <Link to="/comparisons/best-investing-apps" className="group block flex-1">
                <div className="glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col justify-center">
                  <div className="text-xs font-medium text-white/40 mb-3 tracking-widest uppercase">Wealth</div>
                  <h3 className="text-2xl font-medium text-white mb-3">Modern Investment Platforms</h3>
                  <p className="text-white/50 mb-6 font-light">Comparing execution speed, fees, and interface clarity across top brokers.</p>
                  <span className="text-sm font-medium text-white flex items-center mt-auto">Read Analysis <ArrowUpRight className="ml-1 h-4 w-4" /></span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]"></div>
        <div className="container relative mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-5xl md:text-6xl font-semibold text-white tracking-tight mb-8">Ready to elevate your work?</h2>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-12 font-light">
            Join thousands of professionals using DesignForge to streamline their digital operations.
          </p>
          <Link 
            to="/tools" 
            className="inline-flex items-center justify-center px-10 py-5 text-base font-medium text-black bg-white rounded-full hover:scale-105 transition-transform"
          >
            Access Platform
          </Link>
        </div>
      </section>
    </div>
  );
}
