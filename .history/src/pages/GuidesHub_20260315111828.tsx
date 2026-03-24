import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
import { SEOHead } from "@/src/components/seo/SEOHead";

/* ── Guide card visuals ── */
function GenericGuideVis({ color, label, lines }: { color: string; label: string; lines: number[] }) {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: `linear-gradient(160deg,${color}08,#0a0a0a 60%,${color}05)` }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: `radial-gradient(ellipse,${color}30 0%,transparent 70%)`, filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-2">
        <motion.div className="flex items-center gap-1.5 mb-1"
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <BookOpen className="h-3.5 w-3.5" style={{ color: `${color}99` }} />
          <span className="text-[8px] font-bold tracking-wider uppercase" style={{ color: `${color}80` }}>{label}</span>
        </motion.div>
        {lines.map((w, i) => (
          <motion.div key={i} className="h-[3px] rounded-full self-start" style={{ width: `${w}%`, background: i === 0 ? `${color}60` : `${color}15` }}
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }} />
        ))}
      </div>
    </div>
  );
}

function BgRemoveGuideVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0408,#0a0a0a 60%,#0c050a)" }}>
      <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(244,63,94,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
        {["1", "2", "3"].map((step, i) => (
          <motion.div key={i} className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: i === 2 ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.05)", color: i === 2 ? "rgb(244,63,94)" : "rgba(255,255,255,0.3)", border: `1px solid ${i === 2 ? "rgba(244,63,94,0.3)" : "rgba(255,255,255,0.1)"}` }}>
              {step}
            </div>
            <span className="text-[7px] text-white/20">{["Upload", "Process", "Download"][i]}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CompoundGuideVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#040d08,#0a0a0a 60%,#040b07)" }}>
      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="flex items-end gap-1 h-10 w-full">
          {[12, 16, 22, 30, 40, 55, 75, 100].map((h, i) => (
            <motion.div key={i} className="flex-1 rounded-t-sm"
              style={{ background: `linear-gradient(180deg, rgba(16,185,129,${0.3 + i*0.08}), rgba(16,185,129,${0.1 + i*0.04}))`, originY: 1 }}
              initial={{ height: 0 }} animate={{ height: `${h * 0.4}px` }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }} />
          ))}
        </div>
      </div>
      <motion.div className="absolute top-3 left-4 text-[9px] font-bold text-emerald-400/60"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>Year 1 → 30</motion.div>
    </div>
  );
}

function CreditCardGuideVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0804,#0a0a0a 60%,#0c0a05)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(245,158,11,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        {[{ rotate: -6, bg: "linear-gradient(135deg,#fbbf24,#d97706)" }, { rotate: 4, bg: "linear-gradient(135deg,#6366f1,#4f46e5)" }].map((card, i) => (
          <motion.div key={i} className="w-16 h-10 rounded-md shadow-lg" style={{ transform: `rotate(${card.rotate}deg)`, background: card.bg }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}>
            <div className="absolute top-1.5 left-1.5 w-3 h-2 rounded-[1px] border border-white/30 bg-white/10" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const guideVisuals: Record<string, () => React.ReactElement> = {
  "how-to-remove-image-background": BgRemoveGuideVis,
  "compound-interest-explained": CompoundGuideVis,
  "how-to-compare-credit-cards": CreditCardGuideVis,
  "how-to-compress-pdf": () => <GenericGuideVis color="#8b5cf6" label="PDF Guide" lines={[80, 65, 70, 50]} />,
  "how-to-merge-pdf-files": () => <GenericGuideVis color="#3b82f6" label="Merge Guide" lines={[75, 60, 55, 65]} />,
  "how-currency-conversion-works": () => <GenericGuideVis color="#f59e0b" label="Currency" lines={[85, 70, 60, 45]} />,
  "how-loan-emi-works": () => <GenericGuideVis color="#14b8a6" label="Loan EMI" lines={[80, 60, 70, 55]} />,
  "how-to-choose-a-resume-builder": () => <GenericGuideVis color="#a855f7" label="Resume" lines={[75, 65, 55, 60]} />,
  "how-to-choose-ai-writing-tools": () => <GenericGuideVis color="#6366f1" label="AI Tools" lines={[85, 70, 55, 45]} />,
  "how-mortgage-calculators-work": () => <GenericGuideVis color="#10b981" label="Mortgage" lines={[80, 65, 75, 50]} />,
  "how-to-create-strong-passwords": () => <GenericGuideVis color="#22c55e" label="Passwords" lines={[85, 70, 60, 50]} />,
  "how-to-use-qr-codes-effectively": () => <GenericGuideVis color="#eab308" label="QR Codes" lines={[75, 65, 55, 60]} />,
  "how-to-choose-a-color-palette": () => <GenericGuideVis color="#ec4899" label="Colors" lines={[80, 70, 60, 45]} />,
  "how-to-write-markdown": () => <GenericGuideVis color="#38bdf8" label="Markdown" lines={[85, 65, 55, 70]} />,
  "how-to-use-seo-analyzer": () => <GenericGuideVis color="#3b82f6" label="SEO Audit" lines={[85, 75, 60, 50]} />,
};

export function GuidesHub() {
  const guides = [
    {
      id: "how-to-remove-image-background",
      title: "How to Remove Image Backgrounds",
      description: "A step-by-step guide to isolating subjects in your photos for professional results.",
      category: "Design",
      path: "/guides/how-to-remove-image-background"
    },
    {
      id: "how-to-compress-pdf",
      title: "How to Compress PDF Files",
      description: "Learn how to reduce file size without sacrificing document quality or readability.",
      category: "Productivity",
      path: "/guides/how-to-compress-pdf"
    },
    {
      id: "how-to-merge-pdf-files",
      title: "How to Merge PDF Files",
      description: "The simplest way to combine multiple documents into one seamless file.",
      category: "Productivity",
      path: "/guides/how-to-merge-pdf-files"
    },
    {
      id: "how-currency-conversion-works",
      title: "How Currency Conversion Works",
      description: "Understanding exchange rates, spreads, and hidden transaction fees.",
      category: "Finance",
      path: "/guides/how-currency-conversion-works"
    },
    {
      id: "compound-interest-explained",
      title: "Compound Interest Explained",
      description: "How your money makes money over time, and why starting early matters.",
      category: "Finance",
      path: "/guides/compound-interest-explained"
    },
    {
      id: "how-loan-emi-works",
      title: "How Loan EMI Works",
      description: "Understanding principal, interest, and the math behind amortization.",
      category: "Finance",
      path: "/guides/how-loan-emi-works"
    },
    {
      id: "how-to-compare-credit-cards",
      title: "How to Compare Credit Cards",
      description: "What to look for when choosing your next card, from APR to rewards programs.",
      category: "Finance",
      path: "/guides/how-to-compare-credit-cards"
    },
    {
      id: "how-to-choose-a-resume-builder",
      title: "How to Choose a Resume Builder",
      description: "Key features to look for in professional resume software.",
      category: "Career",
      path: "/guides/how-to-choose-a-resume-builder"
    },
    {
      id: "how-to-choose-ai-writing-tools",
      title: "How to Choose AI Writing Tools",
      description: "Finding the right AI assistant for your specific writing needs.",
      category: "Productivity",
      path: "/guides/how-to-choose-ai-writing-tools"
    },
    {
      id: "how-mortgage-calculators-work",
      title: "How Mortgage Calculators Work",
      description: "Understanding home loans, down payments, PMI, and total cost of ownership.",
      category: "Finance",
      path: "/guides/how-mortgage-calculators-work"
    },
    {
      id: "how-to-create-strong-passwords",
      title: "How to Create Strong Passwords",
      description: "Best practices for generating and managing secure passwords across all your accounts.",
      category: "Security",
      path: "/guides/how-to-create-strong-passwords"
    },
    {
      id: "how-to-use-qr-codes-effectively",
      title: "How to Use QR Codes Effectively",
      description: "From marketing to menus — learn how to create, customize, and deploy QR codes.",
      category: "Utility",
      path: "/guides/how-to-use-qr-codes-effectively"
    },
    {
      id: "how-to-choose-a-color-palette",
      title: "How to Choose a Color Palette",
      description: "Color theory fundamentals and practical tips for picking harmonious design palettes.",
      category: "Design",
      path: "/guides/how-to-choose-a-color-palette"
    },
    {
      id: "how-to-write-markdown",
      title: "How to Write Markdown",
      description: "A beginner-friendly guide to Markdown syntax for documentation, blogs, and README files.",
      category: "Dev",
      path: "/guides/how-to-write-markdown"
    },
    {
      id: "how-to-use-seo-analyzer",
      title: "How to Use an SEO Analyzer",
      description: "Learn how to run a website SEO audit, interpret the scores, and fix the issues that impact your search rankings.",
      category: "SEO",
      path: "/guides/how-to-use-seo-analyzer"
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-sky-300/30 selection:text-white">
      <SEOHead
        title="How-To Guides & Tutorials — PDF, Image, Finance & More"
        description="Step-by-step guides on how to compress PDFs, remove image backgrounds, understand compound interest, calculate loan EMI, and compare credit cards."
        canonical="/guides"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <RevealOnScroll className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 text-sky-400 text-xs font-medium uppercase tracking-widest mb-8">
            Actionable Guides
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
            Knowledge to help you <span className="text-sky-400">work smarter</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            Step-by-step tutorials, educational content, and practical advice to help you work smarter and make better decisions.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide, i) => {
            const Visual = guideVisuals[guide.id];
            return (
            <RevealOnScroll key={guide.id} delay={Math.min(i * 0.05, 0.35)} className="h-full">
            <Link to={guide.path} className="group glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2 hover:bg-sky-500/[0.03] hover:border-sky-500/20 h-full">
              <div className="h-36 relative overflow-hidden rounded-t-3xl">
                {Visual ? <Visual /> : <div className="w-full h-full bg-sky-500/5" />}
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400/60 group-hover:text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-sky-400/50 uppercase tracking-widest">{guide.category}</span>
                </div>
                <h3 className="text-2xl font-medium text-white mb-4 group-hover:text-sky-300 transition-colors">{guide.title}</h3>
                <p className="text-white/50 mb-8 flex-1 font-light leading-relaxed">{guide.description}</p>
                <div className="flex items-center text-sm font-medium text-sky-400/50 group-hover:text-sky-400 transition-colors uppercase tracking-widest mt-auto">
                  Read Guide <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
            </RevealOnScroll>
          );
          })}
        </div>
      </div>
    </div>
  );
}
