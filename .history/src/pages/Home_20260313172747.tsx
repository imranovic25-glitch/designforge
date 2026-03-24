import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, FileDown, FilePlus2, ArrowLeftRight, TrendingUp, Landmark, ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { LiquidHero, LiquidDrops, LiquidRipple } from "@/src/components/effects/LiquidHero";
import { LogoIntro } from "@/src/components/effects/LogoIntro";

/* ─── Micro-visualization components ─────────────────────────────── */

/** Animated upward sparkline for Compound Interest */
function SparklineViz() {
  const points = [28, 22, 30, 18, 35, 25, 42, 32, 55, 45, 68, 58, 82];
  const w = 120, h = 44;
  const min = Math.min(...points), max = Math.max(...points);
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M${coords.join("L")}`;
  const fillD = `M0,${h} L${coords.join("L")} L${w},${h} Z`;
  return (
    <div className="w-full h-11 overflow-hidden">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
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
      </svg>
    </div>
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
            {/* Hero image — full-width photo strip above heading */}
            <motion.div variants={itemVariants} className="mb-10 relative mx-auto max-w-4xl rounded-2xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=500&dpr=2"
                alt="Team collaborating on digital work"
                className="w-full h-56 md:h-72 object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
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

      {/* Trust strip removed — new site, no verified partner logos yet */}

      {/* Core Tools Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">Core Utilities</h2>
            <p className="text-xl text-white/50 max-w-2xl font-light">High-performance tools engineered to solve specific problems with zero friction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Background Remover */}
            <AnimatedCard delay={0}>
              <Link to="/tools/background-remover" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div className="mb-6 h-10">
                  <BgRemoverViz />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Background Remover</h3>
                <p className="text-white/50 leading-relaxed mb-8 flex-1">Isolate subjects instantly with our precision AI model. Perfect for product photography.</p>
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </AnimatedCard>

            {/* PDF Compressor */}
            <AnimatedCard delay={0.06}>
              <Link to="/tools/pdf-compressor" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="mb-6 h-10">
                  <CompressViz />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">PDF Compressor</h3>
                <p className="text-white/50 leading-relaxed mb-8 flex-1">Reduce file sizes dramatically while maintaining pixel-perfect readability.</p>
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </AnimatedCard>

            {/* PDF Merger */}
            <AnimatedCard delay={0.12}>
              <Link to="/tools/pdf-merger" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="mb-6 h-10">
                  <MergeViz />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">PDF Merger</h3>
                <p className="text-white/50 leading-relaxed mb-8 flex-1">Combine multiple documents into a single, cohesive file securely and instantly.</p>
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </AnimatedCard>

            {/* Currency Converter */}
            <AnimatedCard delay={0.18}>
              <Link to="/tools/currency-converter" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div className="mb-6 h-10">
                  <CurrencyViz />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Currency Converter</h3>
                <p className="text-white/50 leading-relaxed mb-8 flex-1">Real-time global exchange rates with mid-market accuracy.</p>
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </AnimatedCard>

            {/* Compound Interest */}
            <AnimatedCard delay={0.24}>
              <Link to="/tools/compound-interest-calculator" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="mb-6 h-11 overflow-hidden">
                  <SparklineViz />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Compound Interest</h3>
                <p className="text-white/50 leading-relaxed mb-8 flex-1">Model your financial future with advanced contribution and growth visualizations.</p>
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </AnimatedCard>

            {/* Loan Calculator */}
            <AnimatedCard delay={0.30}>
              <Link to="/tools/loan-emi-calculator" className="group glass-panel rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-500 flex flex-col h-full">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div className="mb-6">
                  <LoanViz />
                </div>
                <h3 className="text-2xl font-medium text-white mb-3">Loan Calculator</h3>
                <p className="text-white/50 leading-relaxed mb-8 flex-1">Deconstruct your borrowing costs with precise amortization schedules.</p>
                <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                  Launch Tool <ArrowUpRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </AnimatedCard>
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
            {/* Large card — Credit Cards — Pexels photo */}
            <AnimatedCard delay={0}>
              <Link to="/comparisons/best-credit-cards" className="group block h-full">
                <div className="glass-panel rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col">
                  {/* Photo area with overlay */}
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src="https://images.pexels.com/photos/6347720/pexels-photo-6347720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                      alt="Premium credit cards on dark surface"
                      className="w-full h-full object-cover scale-[1.03] group-hover:scale-[1.07] transition-transform duration-700"
                    />
                    {/* Darken + tint overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
                    {/* Category badge on photo */}
                    <div className="absolute top-5 left-5 inline-flex items-center rounded-full border border-white/15 bg-black/50 backdrop-blur-md px-3 py-1 text-[10px] font-semibold tracking-widest uppercase text-white/70">
                      Finance Report
                    </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="text-3xl font-medium text-white mb-4">The Definitive Guide to Premium Credit Cards</h3>
                    <p className="text-white/50 mb-8 flex-1 text-lg font-light leading-relaxed">An exhaustive analysis of rewards, travel perks, and hidden benefits across the top-tier financial products of 2026.</p>
                    <span className="text-sm font-medium text-white flex items-center">Read Analysis <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
                  </div>
                </div>
              </Link>
            </AnimatedCard>

            <div className="flex flex-col gap-8">
              {/* Small card 1 — AI Writing — animated typing viz */}
              <AnimatedCard delay={0.1} className="flex-1">
                <Link to="/comparisons/best-ai-writing-tools" className="group block h-full">
                  <div className="glass-panel rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col">
                    {/* Photo area */}
                    <div className="h-36 relative overflow-hidden">
                      <img
                        src="https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2"
                        alt="AI writing on laptop"
                        className="w-full h-full object-cover scale-[1.03] group-hover:scale-[1.07] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-3 left-4 inline-flex items-center rounded-full border border-white/15 bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-semibold tracking-widest uppercase text-white/60">
                        Productivity
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                      <h3 className="text-2xl font-medium text-white mb-3">Evaluating AI Writing Assistants</h3>
                      <p className="text-white/50 mb-6 font-light">Which models actually improve output quality versus just generating noise.</p>
                      <span className="text-sm font-medium text-white flex items-center mt-auto">Read Analysis <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
              
              {/* Small card 2 — Investing — animated chart viz */}
              <AnimatedCard delay={0.18} className="flex-1">
                <Link to="/comparisons/best-investing-apps" className="group block h-full">
                  <div className="glass-panel rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col">
                    {/* Photo area */}
                    <div className="h-36 relative overflow-hidden">
                      <img
                        src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2"
                        alt="Investment charts on screen"
                        className="w-full h-full object-cover scale-[1.03] group-hover:scale-[1.07] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      <div className="absolute top-3 left-4 inline-flex items-center rounded-full border border-white/15 bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-semibold tracking-widest uppercase text-white/60">
                        Wealth
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                      <h3 className="text-2xl font-medium text-white mb-3">Modern Investment Platforms</h3>
                      <p className="text-white/50 mb-6 font-light">Comparing execution speed, fees, and interface clarity across top brokers.</p>
                      <span className="text-sm font-medium text-white flex items-center mt-auto">Read Analysis <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /></span>
                    </div>
                  </div>
                </Link>
              </AnimatedCard>
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
