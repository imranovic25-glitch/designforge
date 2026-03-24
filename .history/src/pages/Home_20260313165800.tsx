import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, FileText, Calculator, CreditCard, TrendingUp, ArrowUpRight } from "lucide-react";
import { motion, useAnimation, useInView } from "motion/react";
import { LiquidHero, LiquidDrops, LiquidRipple } from "@/src/components/effects/LiquidHero";
import { LogoIntro } from "@/src/components/effects/LogoIntro";

/* ─── Micro-visualization components ─────────────────────────────── */

/** Animated upward sparkline for Compound Interest */
function SparklineViz() {
  const points = [28, 22, 30, 18, 35, 25, 42, 32, 55, 45, 68, 58, 82];
  const w = 120, h = 52;
  const min = Math.min(...points), max = Math.max(...points);
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  });
  const pathD = `M${coords.join("L")}`;
  const fillD = `M0,${h} L${coords.join("L")} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="sg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <linearGradient id="sg-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
        </linearGradient>
      </defs>
      <motion.path d={fillD} fill="url(#sg-fill)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />
      <motion.path d={pathD} fill="none" stroke="url(#sg-line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
      <motion.circle r="3" fill="white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1], cx: coords.map(c => parseFloat(c.split(",")[0])), cy: coords.map(c => parseFloat(c.split(",")[1])) } as never}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }} />
    </svg>
  );
}

/** Shrinking file-size bar for PDF Compressor */
function CompressViz() {
  return (
    <div className="flex items-end gap-2 h-10 w-full">
      {[100, 78, 56, 38, 24].map((p, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-white/20"
          style={{ originY: 1 }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: p / 100, opacity: 0.3 + (1 - p / 100) * 0.6 }}
          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="text-[10px] font-bold text-white/70 tabular-nums"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        >−76%</motion.div>
      </div>
    </div>
  );
}

/** Two doc-shapes merging for PDF Merger */
function MergeViz() {
  return (
    <div className="flex items-center justify-center gap-1 h-10">
      {[0, 1].map(i => (
        <motion.div
          key={i}
          className="w-7 h-9 rounded border border-white/20 bg-white/[0.06] flex flex-col gap-1 p-1"
          initial={{ x: i === 0 ? -18 : 18, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {[1, 0.7, 0.5].map((o, j) => (
            <div key={j} className="h-px rounded-full bg-white" style={{ opacity: o * 0.4 }} />
          ))}
        </motion.div>
      ))}
      <motion.div
        className="w-1 h-9 flex items-center justify-center"
        initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.0 }}
      >
        <div className="w-px h-full bg-white/30" />
      </motion.div>
      <motion.div
        className="w-7 h-9 rounded border border-white/40 bg-white/[0.10] flex flex-col gap-1 p-1"
        initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {[1, 0.7, 0.5, 0.3].map((o, j) => (
          <div key={j} className="h-px rounded-full bg-white" style={{ opacity: o * 0.6 }} />
        ))}
      </motion.div>
    </div>
  );
}

/** Currency arrows for Currency Converter */
function CurrencyViz() {
  const pairs = [["USD", "EUR"], ["GBP", "JPY"], ["INR", "AED"]];
  return (
    <div className="flex flex-col gap-1 w-full">
      {pairs.map(([a, b], i) => (
        <motion.div
          key={i}
          className="flex items-center gap-1.5 text-[10px] font-semibold"
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
        >
          <span className="text-white/60 w-7">{a}</span>
          <motion.div className="flex-1 h-px bg-white/10 relative overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-white/60 rounded-full"
              initial={{ width: "0%" }} animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: i * 0.15 + 0.5, ease: "easeOut" }}
            />
          </motion.div>
          <span className="text-white/80 w-7 text-right">{b}</span>
        </motion.div>
      ))}
    </div>
  );
}

/** Segmented amortization bar for Loan Calculator */
function LoanViz() {
  const segments = [
    { label: "P", pct: 62, color: "rgba(255,255,255,0.75)" },
    { label: "I", pct: 28, color: "rgba(255,255,255,0.25)" },
    { label: "F", pct: 10, color: "rgba(255,255,255,0.10)" },
  ];
  return (
    <div className="w-full space-y-1.5">
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {segments.map((s, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{ backgroundColor: s.color }}
            initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
            transition={{ duration: 0.8, delay: i * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1 text-[9px] text-white/50">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label === "P" ? "Principal" : s.label === "I" ? "Interest" : "Fees"}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Silhouette reveal (checkerboard fade) for Background Remover */
function BgRemoverViz() {
  return (
    <div className="relative w-full h-10 rounded overflow-hidden">
      {/* Checkerboard side */}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className={(Math.floor(i / 6) + i % 6) % 2 === 0 ? "bg-white/10" : "bg-white/5"} />
        ))}
      </div>
      {/* Reveal wipe */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.9) 100%)" }}
        initial={{ x: "100%" }} animate={{ x: "0%" }}
        transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Silhouette icon */}
      <motion.svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6"
        viewBox="0 0 24 24" fill="rgba(255,255,255,0.8)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
      </motion.svg>
    </div>
  );
}

/* ─── Animated card wrapper: triggers children when scrolled into view ─── */
function AnimatedCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Home() {
  const [showIntro, setShowIntro] = useState(() => {
    try { return !sessionStorage.getItem("df-intro-done"); } catch { return false; }
  });

  function handleIntroDone() {
    try { sessionStorage.setItem("df-intro-done", "1"); } catch { /* */ }
    setShowIntro(false);
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-black selection:bg-white/30 selection:text-white">
      {showIntro && <LogoIntro onDone={handleIntroDone} />}

      {/* ═══ Hero Section — Premium Liquid Animation ═══════════════════ */}
      <section className="relative overflow-hidden pt-40 pb-32 lg:pt-52 lg:pb-44">
        {/* Layer 1: WebGL metaball canvas */}
        <div className="absolute inset-0 -z-10">
          <LiquidHero />
        </div>

        {/* Layer 2: CSS liquid drops (soft, blurred orbs) */}
        <LiquidDrops className="-z-[9]" />

        {/* Layer 3: Expanding ripple rings */}
        <LiquidRipple className="z-0 opacity-50" />

        {/* Layer 4: Radial depth vignette */}
        <div
          className="absolute inset-0 -z-[8] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, black 100%)",
          }}
        />

        {/* Layer 5: Top grain texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] -z-[7] pointer-events-none" />

        {/* Content */}
        <div className="container relative z-10 mx-auto px-6 lg:px-12 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-white/70 mb-8 backdrop-blur-md">
              <span className="relative flex h-2 w-2 mr-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              DesignForge 2.0 is now live
            </motion.div>
            
            {/* Heading with liquid shimmer */}
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-[88px] font-semibold tracking-tighter text-white leading-[1.02] mb-8">
              The&nbsp;infrastructure&nbsp;for <br className="hidden md:block" />
              <span className="liquid-shimmer-text">smarter digital work.</span>
            </motion.h1>
            
            {/* Subhead */}
            <motion.p variants={itemVariants} className="mt-4 text-xl md:text-2xl text-white/40 max-w-3xl mx-auto leading-relaxed font-light">
              Enterprise-grade tools, financial calculators, and editorial insights designed to elevate your workflow and decision-making.
            </motion.p>
            
            {/* CTAs */}
            <motion.div variants={itemVariants} className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                to="/tools" 
                className="group relative inline-flex items-center justify-center px-9 py-4 text-sm font-medium text-black bg-white rounded-full overflow-hidden transition-all hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
              >
                <span className="relative z-10 flex items-center">
                  Explore Platform <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                to="/finance" 
                className="group inline-flex items-center justify-center px-9 py-4 text-sm font-medium text-white/80 bg-white/[0.04] border border-white/10 rounded-full hover:bg-white/[0.08] hover:border-white/15 transition-all backdrop-blur-sm"
              >
                Visit Finance Hub
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              variants={itemVariants}
              className="mt-20 flex flex-col items-center"
            >
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/20 font-medium mb-3">Scroll</span>
              <div className="w-5 h-9 rounded-full border border-white/15 flex justify-center pt-2">
                <motion.div
                  className="w-1 h-2 rounded-full bg-white/40"
                  animate={{ y: [0, 10, 0], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
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
