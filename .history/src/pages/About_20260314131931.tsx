import { Link } from "react-router-dom";
import { ArrowRight, Shield, Lightbulb, Eye, Code, Globe, Users } from "lucide-react";
import { motion } from "motion/react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
import { SEOHead } from "@/src/components/seo/SEOHead";

/* ── Unique visuals for each value card ── */
function ToolsVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0a0608,#0a0a0a 60%,#08060c)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(168,85,247,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
        {[
          { icon: "PDF", color: "#ef4444", glow: "rgba(239,68,68,0.15)" },
          { icon: "IMG", color: "#8b5cf6", glow: "rgba(139,92,246,0.15)" },
          { icon: "AI", color: "#3b82f6", glow: "rgba(59,130,246,0.15)" },
        ].map((t, i) => (
          <motion.div key={i}
            className="w-16 h-20 rounded-lg flex flex-col items-center justify-center gap-1"
            style={{ background: `linear-gradient(135deg, ${t.glow}, transparent)`, border: `1px solid ${t.color}33` }}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <div className="text-[10px] font-bold" style={{ color: t.color }}>{t.icon}</div>
            {[55, 40, 50].map((w, j) => <div key={j} className="h-[2px] rounded-full bg-white/8" style={{ width: `${w}%` }} />)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FinanceVis() {
  const bars = [
    { h: 18, color: "rgba(16,185,129,0.8)" },
    { h: 28, color: "rgba(16,185,129,0.7)" },
    { h: 22, color: "rgba(16,185,129,0.6)" },
    { h: 38, color: "rgba(16,185,129,0.85)" },
    { h: 32, color: "rgba(16,185,129,0.75)" },
    { h: 44, color: "rgba(16,185,129,0.9)" },
  ];
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#040d08,#0a0a0a 60%,#040b07)" }}>
      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-end justify-center pb-6 px-8 gap-2">
        {bars.map((b, i) => (
          <motion.div key={i} className="flex-1 rounded-t-sm"
            style={{ background: b.color, originY: 1 }}
            initial={{ height: 0 }} animate={{ height: b.h }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </div>
      <motion.div className="absolute top-3 right-4 text-[10px] font-bold text-emerald-400"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>+24.7%</motion.div>
    </div>
  );
}

function EditorialVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0804,#0a0a0a 60%,#0c0a05)" }}>
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(245,158,11,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <motion.div key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: i <= 4 ? "rgba(245,158,11,0.9)" : "rgba(255,255,255,0.15)" }}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }} />
          ))}
          <motion.span className="text-[10px] font-bold text-amber-400 ml-1"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>4.8/5</motion.span>
        </div>
      </div>
      <div className="absolute bottom-3 left-4 right-4 space-y-1.5">
        {[70, 55, 65].map((w, i) => (
          <motion.div key={i} className="h-[2px] rounded-full bg-amber-400/15"
            style={{ width: `${w}%` }}
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }} />
        ))}
      </div>
    </div>
  );
}

const values = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy First",
    description: "All tools run in your browser. Files never leave your device — zero server uploads, zero tracking.",
    color: "emerald",
  },
  {
    icon: <Lightbulb className="h-6 w-6" />,
    title: "Built for Clarity",
    description: "Every calculator, tool, and guide is designed for immediate understanding — no bloat, no confusion.",
    color: "amber",
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Editorial Independence",
    description: "Our comparisons and rankings are never influenced by commissions. We prioritize what genuinely serves readers.",
    color: "violet",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "No Signups Required",
    description: "Every feature is free and accessible instantly. No accounts, no paywalls, no hidden limitations.",
    color: "sky",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global by Design",
    description: "Finance tools support multiple countries and currencies. Content is written for a worldwide audience.",
    color: "rose",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Community Driven",
    description: "We build what users request. Every new tool and guide is shaped by real feedback from our community.",
    color: "orange",
  },
];

const colorMap: Record<string, { badge: string; icon: string; iconHover: string; glow: string }> = {
  emerald: { badge: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400", icon: "bg-emerald-500/10 text-emerald-400/70", iconHover: "group-hover:bg-emerald-500/20 group-hover:text-emerald-400", glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]" },
  amber:   { badge: "border-amber-500/20 bg-amber-500/5 text-amber-400", icon: "bg-amber-500/10 text-amber-400/70", iconHover: "group-hover:bg-amber-500/20 group-hover:text-amber-400", glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]" },
  violet:  { badge: "border-violet-500/20 bg-violet-500/5 text-violet-400", icon: "bg-violet-500/10 text-violet-400/70", iconHover: "group-hover:bg-violet-500/20 group-hover:text-violet-400", glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]" },
  sky:     { badge: "border-sky-500/20 bg-sky-500/5 text-sky-400", icon: "bg-sky-500/10 text-sky-400/70", iconHover: "group-hover:bg-sky-500/20 group-hover:text-sky-400", glow: "group-hover:shadow-[0_0_30px_rgba(56,189,248,0.1)]" },
  rose:    { badge: "border-rose-500/20 bg-rose-500/5 text-rose-400", icon: "bg-rose-500/10 text-rose-400/70", iconHover: "group-hover:bg-rose-500/20 group-hover:text-rose-400", glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.1)]" },
  orange:  { badge: "border-orange-500/20 bg-orange-500/5 text-orange-400", icon: "bg-orange-500/10 text-orange-400/70", iconHover: "group-hover:bg-orange-500/20 group-hover:text-orange-400", glow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]" },
};

export function About() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-violet-300/30 selection:text-white">
      <SEOHead
        title="About DesignForge360 — Free Tools, Finance & Expert Comparisons"
        description="DesignForge360 is a free platform offering browser-based PDF and image tools, financial calculators, and independent expert comparisons — no signup, no ads."
        canonical="/about"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">

        {/* Hero */}
        <RevealOnScroll className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-medium uppercase tracking-widest mb-8">
            About Us
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
            Built for people who <span className="text-violet-400">demand better</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            Professional-grade tools and financial clarity should be accessible to everyone — not just those who can afford expensive software subscriptions or financial advisors.
          </p>
        </RevealOnScroll>

        {/* What we offer — 3 visual cards */}
        <section className="mb-32">
          <RevealOnScroll className="mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">What We Offer</h2>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Practical Tools", desc: "Image processing and PDF utilities that work entirely in your browser. No uploads, no privacy concerns.", Visual: ToolsVis, path: "/tools" },
              { title: "Financial Calculators", desc: "Compound growth, loan structures, and real-time currency conversions — built for clarity and accuracy.", Visual: FinanceVis, path: "/finance" },
              { title: "Editorial Content", desc: "Independent comparisons and guides written to educate. We explain how products work before ranking them.", Visual: EditorialVis, path: "/comparisons" },
            ].map((item, i) => (
              <RevealOnScroll key={item.title} delay={i * 0.08} className="h-full">
                <Link to={item.path} className="group glass-panel rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:bg-violet-500/[0.03] hover:border-violet-500/20">
                  <div className="h-40 relative overflow-hidden rounded-t-3xl">
                    <item.Visual />
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-medium text-white mb-4">{item.title}</h3>
                    <p className="text-white/50 mb-8 flex-1 font-light leading-relaxed">{item.desc}</p>
                    <div className="flex items-center text-sm font-medium text-violet-400/50 group-hover:text-violet-400 transition-colors uppercase tracking-widest mt-auto">
                      Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        </section>

        {/* Values grid */}
        <section className="mb-32">
          <RevealOnScroll className="max-w-2xl mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-6">Our Principles</h2>
            <p className="text-lg text-white/50 font-light leading-relaxed">
              These aren't marketing slogans. They're the constraints we build within every single day.
            </p>
          </RevealOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const c = colorMap[v.color];
              return (
                <RevealOnScroll key={v.title} delay={Math.min(i * 0.06, 0.35)} className="h-full">
                  <div className={`group glass-panel rounded-3xl p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 ${c.glow}`}>
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-colors ${c.icon} ${c.iconHover}`}>
                      {v.icon}
                    </div>
                    <h3 className="text-xl font-medium text-white mb-3">{v.title}</h3>
                    <p className="text-white/50 font-light leading-relaxed">{v.description}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </section>

        {/* Team / Story section */}
        <section className="mb-32">
          <div className="glass-panel rounded-3xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left: visual */}
              <div className="lg:w-2/5 h-64 lg:h-auto relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0c0618,#0a0a0a 60%,#080612)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(139,92,246,0.25) 0%,transparent 70%)", filter: "blur(30px)" }} />
                <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.2) 0%,transparent 70%)", filter: "blur(25px)" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center"
                    style={{ boxShadow: "0 0 40px rgba(139,92,246,0.15)" }}>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-black" />
                    </div>
                  </motion.div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest uppercase text-white/20">Est. 2024</div>
              </div>
              {/* Right: text */}
              <div className="p-10 lg:p-14 flex-1">
                <RevealOnScroll>
                  <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-6">Our Story</h2>
                  <div className="space-y-5 text-white/60 font-light leading-relaxed text-lg">
                    <p>
                      We are a small team of designers, developers, and financial enthusiasts who got tired of the bloated, ad-filled, and privacy-invasive tools available online. So we built better ones.
                    </p>
                    <p>
                      DesignForge360 started as a side project and grew into a platform used by thousands. Every tool, calculator, and guide is crafted with the same attention to detail you'd expect from premium software — except it's completely free.
                    </p>
                    <p>
                      Based in <strong className="text-white font-medium">India</strong>, we serve a global audience. Questions or ideas? Reach out at{" "}
                      <a href="mailto:motionbox96@gmail.com" className="text-violet-400 hover:text-violet-300 transition-colors underline underline-offset-4">motionbox96@gmail.com</a>.
                    </p>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <RevealOnScroll>
          <div className="text-center py-20">
            <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">Want to get in touch?</h2>
            <p className="text-xl text-white/50 font-light mb-10 max-w-xl mx-auto">We welcome feedback, suggestions, and partnership enquiries.</p>
            <Link to="/contact" className="inline-flex items-center justify-center px-10 py-5 text-base font-medium text-black bg-white rounded-full hover:scale-105 transition-transform">
              Contact Us <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
