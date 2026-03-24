
import { useState, useEffect, useRef, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, Image as ImageIcon, FileDown, FilePlus2, ArrowLeftRight, TrendingUp, Landmark, ArrowUpRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { LiquidHero, LiquidDrops, LiquidRipple } from "@/src/components/effects/LiquidHero";
import { LogoIntro } from "@/src/components/effects/LogoIntro";
import { SEOHead } from "@/src/components/seo/SEOHead";

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

/* ─── Editorial animated visuals (replace external photo dependencies) ──── */

/** Full-bleed editorial visual: layered floating premium credit cards */
function CreditCardsViz() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0e0b06,#0a0a0a 55%,#07090b)" }}>
      {/* Ambient gold bloom at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[65%] h-[55%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(200,155,40,0.18) 0%,transparent 70%)", filter: "blur(30px)" }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-600/15 to-transparent" />

      {/* Back card — grey, far-left, heavily tilted */}
      <motion.div className="absolute" style={{ left: "4%", top: "22%", rotate: -20 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.35 }}>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}>
          <div className="w-40 rounded-xl border border-white/10 shadow-2xl overflow-hidden relative"
            style={{ height: "90px", background: "linear-gradient(135deg,#2d2d2d,#111)", opacity: 0.5 }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
          </div>
        </motion.div>
      </motion.div>

      {/* Mid card — dark gold, centre-left */}
      <motion.div className="absolute" style={{ left: "24%", top: "28%", rotate: -7 }}
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.18 }}>
        <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}>
          <div className="w-44 rounded-xl border border-yellow-700/20 shadow-2xl overflow-hidden relative"
            style={{ height: "100px", background: "linear-gradient(135deg,#3a2e14,#1c160a)", opacity: 0.78 }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/8 to-transparent" />
            {/* EMV chip */}
            <div className="absolute top-4 left-4 w-7 h-5 rounded-[3px] border border-yellow-700/40 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#8B6914,#C8921A)" }}>
              <div className="absolute inset-[2px] grid grid-cols-2 gap-[1px]">
                {[0,1,2,3].map(j => <div key={j} className="bg-yellow-300/20 rounded-[1px]" />)}
              </div>
            </div>
            <div className="absolute bottom-5 left-4 flex gap-2 opacity-25">
              {[0,1,2,3].map(g => (
                <div key={g} className="flex gap-0.5">
                  {[0,1,2,3].map(k => <div key={k} className="w-[3px] h-[3px] rounded-full bg-white" />)}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Front card — bright gold, right — most prominent */}
      <motion.div className="absolute" style={{ left: "46%", top: "10%", rotate: 5 }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0 }}>
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-52 rounded-xl border border-yellow-500/25 shadow-2xl overflow-hidden relative"
            style={{ height: "120px", background: "linear-gradient(135deg,#C8971A,#7A5510,#3A2A08)" }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/30" />
            {/* Sheen sweep */}
            <motion.div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/18 to-transparent"
              initial={{ left: "-10%" }} animate={{ left: "130%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }} />
            {/* EMV chip */}
            <div className="absolute top-4 left-5 w-8 h-6 rounded-[3px] border border-yellow-300/30 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#D4AF37,#A07820)" }}>
              <div className="absolute inset-[2px] grid grid-cols-2 gap-[1px]">
                {[0,1,2,3].map(j => <div key={j} className="bg-yellow-200/20 rounded-[1px]" />)}
              </div>
            </div>
            {/* Mastercard-style circles */}
            <div className="absolute bottom-4 right-4 flex">
              <div className="w-7 h-7 rounded-full" style={{ background: "rgba(230,45,30,0.85)" }} />
              <div className="w-7 h-7 rounded-full -ml-3.5" style={{ background: "rgba(255,150,0,0.85)" }} />
            </div>
            {/* Card number dots */}
            <div className="absolute bottom-[48px] left-5 flex gap-2 opacity-40">
              {[0,1,2,3].map(g => (
                <div key={g} className="flex gap-0.5">
                  {[0,1,2,3].map(k => <div key={k} className="w-[3px] h-[3px] rounded-full bg-white" />)}
                </div>
              ))}
            </div>
            <div className="absolute top-[14px] right-5 text-[8px] font-bold tracking-[0.2em] text-yellow-200/55 uppercase">Prestige</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Editorial visual — animated AI-writing typing scene */
function AiWritingViz() {
  const lines = [
    { width: "75%", delay: 0.2 },
    { width: "90%", delay: 0.33 },
    { width: "62%", delay: 0.46 },
    { width: "84%", delay: 0.59 },
    { width: "48%", delay: 0.72 },
  ];
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col justify-center gap-2.5 px-6"
      style={{ background: "linear-gradient(160deg,#07060e,#0a0a0a 60%,#060710)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(139,92,246,0.2) 0%,transparent 70%)", filter: "blur(20px)" }} />
      {lines.map((line, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div className="h-[5px] rounded-full bg-white/22"
            initial={{ width: 0 }} animate={{ width: line.width }}
            transition={{ duration: 0.55, delay: line.delay, ease: [0.16, 1, 0.3, 1] }} />
          {i === lines.length - 1 && (
            <motion.div className="w-[2px] h-[14px] rounded-full bg-violet-400/80"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.85, repeat: Infinity }} />
          )}
        </div>
      ))}
    </div>
  );
}

/** Editorial visual — animated investing candlestick chart */
function InvestingViz() {
  const bars = [
    { h: 28, up: true },  { h: 18, up: false },
    { h: 36, up: true },  { h: 22, up: false },
    { h: 44, up: true },  { h: 50, up: true },
  ];
  const lineY = [28, 46, 36, 50, 28, 14];
  const svgW = 200, svgH = 72;
  const stepX = svgW / (lineY.length - 1);
  const ys = lineY.map(v => svgH - (v / 64) * (svgH - 6) - 3);
  const pathD = ys.map((y, i) => `${i === 0 ? "M" : "L"}${i * stepX},${y}`).join(" ");

  return (
    <div className="w-full h-full relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#060d07,#0a0a0a 60%,#060b07)" }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.2) 0%,transparent 70%)", filter: "blur(26px)" }} />
      {/* Candlestick bars */}
      <div className="absolute inset-0 flex items-end justify-center pb-4 px-5 gap-2.5">
        {bars.map((b, i) => (
          <motion.div key={i} className="flex-1 rounded-sm"
            style={{
              originY: 1,
              background: b.up
                ? "linear-gradient(180deg,rgba(16,185,129,0.85),rgba(16,185,129,0.4))"
                : "linear-gradient(180deg,rgba(239,68,68,0.75),rgba(239,68,68,0.35))",
              border: b.up ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(239,68,68,0.25)",
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: b.h, opacity: 1 }}
            transition={{ duration: 0.45, delay: i * 0.08 + 0.2, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
      {/* Rising trend line */}
      <svg className="absolute inset-0 w-full pointer-events-none" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
        <motion.path d={pathD} fill="none" stroke="rgba(16,185,129,0.75)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
    </div>
  );
}

/* ─── Animated card wrapper: triggers children when scrolled into view ─── */
function AnimatedCard({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
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

/* ─── Full tool directory (used by homepage search) ─────────────── */
const ALL_TOOLS = [
  { name: "Background Remover",           category: "Image",   path: "/tools/background-remover" },
  { name: "PDF Compressor",               category: "PDF",     path: "/tools/pdf-compressor" },
  { name: "PDF Merger",                   category: "PDF",     path: "/tools/pdf-merger" },
  { name: "PDF to Word",                  category: "PDF",     path: "/tools/pdf-to-word" },
  { name: "Currency Converter",           category: "Finance", path: "/tools/currency-converter" },
  { name: "Compound Interest Calculator", category: "Finance", path: "/tools/compound-interest-calculator" },
  { name: "Loan / EMI Calculator",        category: "Finance", path: "/tools/loan-emi-calculator" },
  { name: "Resume Builder",               category: "Career",  path: "/tools/resume-builder" },
  { name: "Image Compressor",             category: "Image",   path: "/tools/image-compressor" },
  { name: "Image Converter",              category: "Image",   path: "/tools/image-converter" },
  { name: "Image Resizer",                category: "Image",   path: "/tools/image-resizer" },
  { name: "Word Counter",                 category: "Text",    path: "/tools/word-counter" },
  { name: "JSON Formatter",               category: "Dev",     path: "/tools/json-formatter" },
];

export function Home() {
  const [showIntro, setShowIntro] = useState(() => {
    try { return !sessionStorage.getItem("df-intro-done"); } catch { return false; }
  });

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const searchResults = searchQuery.trim()
    ? ALL_TOOLS.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
      <SEOHead
        title="Free Online Tools, Finance Calculators & Expert Comparisons"
        description="DesignForge360 gives you free browser-based tools (PDF, image, productivity), financial calculators, and independent product comparisons — no signups, no ads."
        canonical="/"
        schema="WebSite"
      />
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

        {/* Content — Split layout: text left, floating tool mockups right */}
        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-20">

            {/* ── Left column: copy + CTAs ─────────────────────────── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="flex-1 min-w-0 max-w-2xl"
            >
              {/* Version badge */}
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium tracking-wide mb-8">
                  <span className="text-yellow-400">⚡</span> DesignForge 2.0 is now live
                </span>
              </motion.div>

              {/* Heading with liquid shimmer */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.05] mb-6"
              >
                The infrastructure<br />
                for <span className="liquid-shimmer-text">smarter digital</span><br />
                work.
              </motion.h1>

              {/* Subhead */}
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-white/45 leading-relaxed font-light mb-10 max-w-xl"
              >
                Enterprise-grade tools, financial calculators, and editorial insights designed to elevate your workflow and decision-making.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start gap-4 mb-14">
                <Link
                  to="/tools"
                  className="group inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-black bg-white rounded-full transition-all hover:scale-[1.04] hover:shadow-[0_0_40px_rgba(255,255,255,0.18)]"
                >
                  Explore Tools <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/finance"
                  className="group inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-white/80 bg-white/[0.04] border border-white/10 rounded-full hover:bg-white/[0.08] hover:border-white/20 transition-all backdrop-blur-sm"
                >
                  Visit Finance Hub
                </Link>
              </motion.div>


            </motion.div>

            {/* ── Right column: floating tool mockup cards ─────────── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative flex-shrink-0 w-[480px] xl:w-[540px] h-[420px] mt-12 lg:mt-0"
              aria-hidden="true"
            >
              {/* Ambient glow behind cards */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute top-1/3 right-0 w-48 h-48 bg-blue-500/15 blur-[60px] rounded-full pointer-events-none" />

              {/* Card 1 — Background Remover (top center) */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-72 rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" }}
              >
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#1a1a1a] border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-[10px] text-white/40 font-medium">Background Remover</span>
                </div>
                <div className="bg-[#111] p-3 flex gap-2">
                  {/* Before */}
                  <div className="flex-1 rounded-lg overflow-hidden relative">
                    <img
                      src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=140&dpr=1"
                      alt=""
                      className="w-full h-24 object-cover object-top grayscale opacity-60"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white/60 px-1.5 py-0.5 rounded">Before</span>
                  </div>
                  {/* After */}
                  <div className="flex-1 rounded-lg overflow-hidden relative" style={{ background: "repeating-conic-gradient(#1e1e1e 0% 25%, #2a2a2a 0% 50%) 0 0 / 12px 12px" }}>
                    <img
                      src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=140&dpr=1"
                      alt=""
                      className="w-full h-24 object-cover object-top"
                      style={{ mixBlendMode: "luminosity" }}
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white/60 px-1.5 py-0.5 rounded">After</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 — PDF Compressor (bottom left) */}
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-0 left-0 w-56 rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#1a1a1a] border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-[10px] text-white/40 font-medium">PDF Compressor</span>
                </div>
                <div className="bg-[#111] p-3 space-y-2.5">
                  <p className="text-[10px] text-white/30">Compressing <span className="text-white/60">report.pdf</span></p>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }}
                      initial={{ width: "0%" }}
                      animate={{ width: ["0%", "78%", "78%", "0%"] }}
                      transition={{ duration: 4, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/40">18.9 MB → 9.5 MB</span>
                    <span className="text-[10px] font-semibold text-violet-400">−49%</span>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 — Compound Interest (bottom right) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute bottom-4 right-0 w-52 rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-1.5 px-3 py-2.5 bg-[#1a1a1a] border-b border-white/[0.06]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                  <span className="ml-2 text-[10px] text-white/40 font-medium">Compound Interest</span>
                </div>
                <div className="bg-[#111] p-3">
                  <p className="text-[10px] text-white/40 mb-1">Calculate Growth — Balance</p>
                  <p className="text-lg font-semibold text-white mb-2">$64,600</p>
                  <SparklineViz />
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6 lg:px-12">

          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">Popular Tools</h2>
              <p className="text-xl text-white/50 max-w-xl font-light">High-performance utilities built for real work — no fluff, zero friction.</p>
            </div>
            <Link
              to="/tools"
              className="shrink-0 inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors uppercase tracking-widest"
            >
              View all tools <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Search bar */}
          <div className="relative mb-16 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/25 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tools… try 'image', 'PDF', 'finance'"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 160)}
                onKeyDown={e => {
                  if (e.key === "Enter") navigate(`/tools${searchQuery.trim() ? `?q=${encodeURIComponent(searchQuery.trim())}` : ""}`);
                  if (e.key === "Escape") { setSearchQuery(""); setSearchOpen(false); }
                }}
                className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-14 pr-12 h-14 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
              />
              {searchQuery && (
                <button
                  onMouseDown={e => { e.preventDefault(); setSearchQuery(""); setSearchOpen(false); }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
                >×</button>
              )}
            </div>

            {/* Results dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              >
                {searchResults.slice(0, 7).map((tool, i) => (
                  <Link
                    key={i}
                    to={tool.path}
                    onClick={() => { setSearchQuery(""); setSearchOpen(false); }}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.06] transition-colors border-b border-white/[0.06] last:border-0 group"
                  >
                    <span className="text-white text-sm font-medium">{tool.name}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-full">{tool.category}</span>
                  </Link>
                ))}
                {searchResults.length > 7 && (
                  <Link
                    to={`/tools?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/[0.03] text-white/30 text-xs hover:text-white/60 transition-colors"
                  >
                    <Search className="h-3.5 w-3.5" /> See all results on Tools page
                  </Link>
                )}
              </motion.div>
            )}

            {/* No results */}
            {searchOpen && searchQuery.trim() && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel rounded-2xl p-5 border border-white/10"
              >
                <p className="text-white/40 text-sm text-center">No tools match &ldquo;<span className="text-white/60">{searchQuery}</span>&rdquo;</p>
                <Link
                  to="/tools"
                  onClick={() => setSearchOpen(false)}
                  className="block text-center text-xs text-white/30 hover:text-white/60 mt-3 transition-colors"
                >
                  Browse all 13 tools →
                </Link>
              </motion.div>
            )}
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
                  <FileDown className="h-6 w-6 text-white" />
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
                  <FilePlus2 className="h-6 w-6 text-white" />
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
                  <ArrowLeftRight className="h-6 w-6 text-white" />
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
                  <Landmark className="h-6 w-6 text-white" />
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

          {/* View all tools CTA */}
          <div className="mt-14 flex justify-center">
            <Link
              to="/tools"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/[0.12] bg-white/[0.04] text-white/70 text-sm font-medium hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white transition-all"
            >
              Browse all {ALL_TOOLS.length} tools <ArrowUpRight className="h-4 w-4" />
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
            {/* Large card — Credit Cards — Pexels photo */}
            <AnimatedCard delay={0}>
              <Link to="/comparisons/best-credit-cards" className="group block h-full">
                <div className="glass-panel rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-all duration-500 h-full flex flex-col">
                  {/* Editorial animated visual */}
                  <div className="h-64 relative overflow-hidden">
                    <CreditCardsViz />
                    {/* Bottom fade so card content blends in */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
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
                    {/* Editorial animated visual */}
                    <div className="h-36 relative overflow-hidden">
                      <AiWritingViz />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
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
                    {/* Editorial animated visual */}
                    <div className="h-36 relative overflow-hidden">
                      <InvestingViz />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
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
            Free tools, financial insights, and expert guides — everything you need to work smarter online.
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
