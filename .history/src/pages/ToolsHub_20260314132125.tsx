import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Image as ImageIcon, ImageDown, FileDown, FilePlus2, FileOutput, ArrowLeftRight, TrendingUp, Landmark, FileUser, Type, Braces, ArrowRightLeft, Maximize2 } from "lucide-react";
import { motion } from "motion/react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
import { SEOHead } from "@/src/components/seo/SEOHead";

/* ── Tool card visuals ── */
function BgRemoverVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0408,#0a0a0a 60%,#0c050a)" }}>
      <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(244,63,94,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: "inset(0 50% 0 0)" }}>
            <svg width="96" height="96" viewBox="0 0 96 96">{[...Array(12)].map((_, r) => [...Array(12)].map((_, c) => <rect key={`${r}-${c}`} x={c*8} y={r*8} width="8" height="8" fill={(r+c)%2===0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"} />))}</svg>
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: "inset(0 0 0 50%)" }}>
            <div className="w-full h-full" style={{ background: "linear-gradient(160deg,rgba(244,63,94,0.1),rgba(251,113,133,0.05))" }} />
          </div>
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px]" style={{ background: "linear-gradient(180deg,transparent,rgba(244,63,94,0.6),transparent)" }} />
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="24" height="30" viewBox="0 0 24 30" fill="none">
            <circle cx="12" cy="7" r="5" fill="rgba(244,63,94,0.3)" stroke="rgba(244,63,94,0.5)" strokeWidth="1" />
            <path d="M2 28C2 20 6 16 12 16C18 16 22 20 22 28" fill="rgba(244,63,94,0.2)" stroke="rgba(244,63,94,0.4)" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PdfCompressorVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#06040d,#0a0a0a 60%,#08050c)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(139,92,246,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-end justify-center pb-5 px-6 gap-1.5">
        {[100, 78, 56, 38, 24].map((pct, i) => (
          <motion.div key={i} className="flex-1 rounded-t-sm" style={{ originY: 1, background: `linear-gradient(180deg, rgba(139,92,246,${0.9 - i*0.12}), rgba(139,92,246,${0.4 - i*0.06}))` }}
            initial={{ height: 0 }} animate={{ height: `${pct * 0.4}px` }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }} />
        ))}
        <motion.span className="text-[10px] font-bold text-violet-400 ml-1 self-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>−76%</motion.span>
      </div>
    </div>
  );
}

function PdfMergerVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#04060d,#0a0a0a 60%,#050810)" }}>
      <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-2">
        {[0,1].map(i => (
          <motion.div key={i} className="w-10 h-14 rounded-md" style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(59,130,246,0.05))", border: "1px solid rgba(59,130,246,0.25)" }}
            initial={{ x: i===0 ? -16 : 16, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="p-1.5 space-y-1">{[0.9,0.6,0.4].map((o,j) => <div key={j} className="h-[2px] rounded-full" style={{ background: `rgba(96,165,250,${o*0.5})` }} />)}</div>
          </motion.div>
        ))}
        <motion.svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="mx-1"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <path d="M0 4h8M6 1l3 3-3 3" stroke="rgba(96,165,250,0.6)" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
        <motion.div className="w-12 h-14 rounded-md" style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(59,130,246,0.08))", border: "1px solid rgba(59,130,246,0.35)", boxShadow: "0 0 12px rgba(59,130,246,0.15)" }}
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}>
          <div className="p-1.5 space-y-1">{[1,0.7,0.5,0.3].map((o,j) => <div key={j} className="h-[2px] rounded-full" style={{ background: `rgba(96,165,250,${o*0.6})` }} />)}</div>
        </motion.div>
      </div>
    </div>
  );
}

function CurrencyVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0b04,#0a0a0a 60%,#0c0a05)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(245,158,11,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6">
        {[{ from: "USD", to: "EUR", rate: "0.92" }, { from: "GBP", to: "JPY", rate: "191.4" }].map((p, i) => (
          <motion.div key={i} className="flex items-center gap-2 text-[10px] font-semibold w-full"
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12 }}>
            <span className="text-amber-400/80 w-7 font-bold">{p.from}</span>
            <div className="flex-1 h-[3px] rounded-full overflow-hidden bg-amber-500/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-amber-500/30"
                initial={{ width: "0%" }} animate={{ width: "100%" }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }} />
            </div>
            <span className="text-amber-300/60 w-7 text-right">{p.to}</span>
            <span className="text-amber-400 text-[9px]">{p.rate}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CompoundVis() {
  const points = [28, 22, 30, 18, 35, 25, 42, 32, 55, 45, 68, 58, 82];
  const w = 120, h = 44;
  const min = Math.min(...points), max = Math.max(...points);
  const coords = points.map((v, i) => `${(i / (points.length - 1)) * w},${h - ((v - min) / (max - min)) * (h - 4) - 2}`);
  const pathD = `M${coords.join("L")}`;
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#040d08,#0a0a0a 60%,#040b07)" }}>
      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
          <defs><linearGradient id="thsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(16,185,129,0.25)" /><stop offset="100%" stopColor="rgba(16,185,129,0)" /></linearGradient></defs>
          <path d={`M0,${h} L${coords.join("L")} L${w},${h} Z`} fill="url(#thsg)" />
          <motion.path d={pathD} fill="none" stroke="rgba(16,185,129,0.8)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
        </svg>
      </div>
      <motion.div className="absolute top-3 right-4 text-[10px] font-bold text-emerald-400"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>+12.4%</motion.div>
    </div>
  );
}

function LoanVis() {
  const segs = [{ pct: 62, color: "rgba(20,184,166,0.85)", label: "Principal" }, { pct: 28, color: "rgba(20,184,166,0.4)", label: "Interest" }, { pct: 10, color: "rgba(20,184,166,0.15)", label: "Fees" }];
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#040a0a,#0a0a0a 60%,#040b0a)" }}>
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(20,184,166,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-3">
        <div className="flex h-4 rounded-full overflow-hidden gap-[2px] w-full">
          {segs.map((s, i) => <motion.div key={i} className="rounded-full" style={{ backgroundColor: s.color }} initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.7, delay: 0.15 + i * 0.12 }} />)}
        </div>
        <div className="flex gap-3">{segs.map(s => <div key={s.label} className="flex items-center gap-1 text-[9px] text-teal-300/60"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />{s.label}</div>)}</div>
      </div>
    </div>
  );
}

function ResumeVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#080508,#0a0a0a 60%,#0a060a)" }}>
      <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(168,85,247,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-28 rounded-lg border border-purple-500/20 bg-white/[0.03] p-2 relative" style={{ boxShadow: "0 0 12px rgba(168,85,247,0.15)" }}>
          <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/30 mb-1.5 mx-auto" />
          <div className="h-[3px] w-10 rounded-full bg-white/15 mb-1 mx-auto" />
          <div className="h-[2px] w-8 rounded-full bg-white/8 mb-2 mx-auto" />
          <div className="space-y-1">{[70,55,65,45].map((w,i) => <div key={i} className="h-[2px] rounded-full bg-purple-400/15" style={{ width: `${w}%` }} />)}</div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>A+</div>
        </div>
      </div>
    </div>
  );
}

function ImageCompressorVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#060a04,#0a0a0a 60%,#080c05)" }}>
      <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(34,197,94,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-1">
            <span className="text-[10px] font-bold text-green-400">4.2MB</span>
          </div>
          <span className="text-[8px] text-white/30">Original</span>
        </div>
        <motion.svg width="16" height="8" viewBox="0 0 16 8" fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <path d="M0 4h12M10 1l3 3-3 3" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeLinecap="round" />
        </motion.svg>
        <motion.div className="text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>
          <div className="w-10 h-10 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-1" style={{ boxShadow: "0 0 10px rgba(34,197,94,0.15)" }}>
            <span className="text-[10px] font-bold text-green-400">890K</span>
          </div>
          <span className="text-[8px] text-green-400/60">-79%</span>
        </motion.div>
      </div>
    </div>
  );
}

function PdfToWordVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#04060d,#0a0a0a 60%,#050810)" }}>
      <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-4 px-6">
        <div className="w-14 h-18 rounded-md border border-red-500/25 bg-red-500/[0.06] flex flex-col items-center justify-center gap-1">
          <div className="text-[9px] font-bold text-red-400">PDF</div>
          {[60,45,55].map((w,i) => <div key={i} className="h-[2px] rounded-full bg-white/8" style={{ width: `${w}%` }} />)}
        </div>
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none"><path d="M0 4h12M10 1l3 3-3 3" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <div className="w-14 h-18 rounded-md border border-indigo-500/25 bg-indigo-500/[0.06] flex flex-col items-center justify-center gap-1" style={{ boxShadow: "0 0 10px rgba(99,102,241,0.15)" }}>
          <div className="text-[9px] font-bold text-indigo-400">DOC</div>
          {[55,65,45].map((w,i) => <div key={i} className="h-[2px] rounded-full bg-indigo-400/15" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    </div>
  );
}

function WordCounterVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0a0806,#0a0a0a 60%,#0c0a06)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(234,179,8,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-2">
        {[{ label: "Words", val: "1,842", w: "85%" }, { label: "Chars", val: "10,450", w: "70%" }, { label: "Reading", val: "7 min", w: "45%" }].map((m, i) => (
          <motion.div key={i} className="flex items-center gap-2 w-full text-[10px]"
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }}>
            <span className="text-white/30 w-12">{m.label}</span>
            <div className="flex-1 h-[3px] rounded-full bg-yellow-500/10 overflow-hidden">
              <motion.div className="h-full rounded-full bg-yellow-500/40" initial={{ width: "0%" }} animate={{ width: m.w }} transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }} />
            </div>
            <span className="text-yellow-400/70 font-bold w-10 text-right">{m.val}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function JsonFormatterVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#04080c,#0a0a0a 60%,#050a0e)" }}>
      <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(6,182,212,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="font-mono text-[9px] space-y-0.5 w-full">
          {['{ "name": "John"', '  "age": 28,', '  "role": "dev"', "}"].map((line, i) => (
            <motion.div key={i} className="text-cyan-400/60" initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}>{line}</motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageConverterVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#080408,#0a0a0a 60%,#0a060a)" }}>
      <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(192,132,252,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-2 px-6">
        {["JPG", "PNG", "WebP"].map((fmt, i) => (
          <motion.div key={fmt} className="px-2 py-1.5 rounded-md text-[9px] font-bold border"
            style={{ borderColor: "rgba(192,132,252,0.2)", background: i === 2 ? "rgba(192,132,252,0.1)" : "transparent", color: i === 2 ? "rgb(192,132,252)" : "rgba(255,255,255,0.3)" }}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1 }}>{fmt}</motion.div>
        ))}
      </div>
    </div>
  );
}

function ImageResizerVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0a04,#0a0a0a 60%,#0c0804)" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-16 rounded-lg border border-amber-500/20 bg-amber-500/[0.04]">
            <div className="absolute top-1 left-1 w-3 h-3"><div className="w-full h-[2px] bg-amber-500/40" /><div className="h-full w-[2px] bg-amber-500/40" /></div>
          </div>
          <motion.div className="absolute top-2 left-2 w-12 h-8 rounded border border-sky-400/30 bg-sky-400/[0.06]"
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }}
            style={{ boxShadow: "0 0 8px rgba(56,189,248,0.15)" }}>
            <div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-[2px] border border-sky-400/60 bg-sky-400/20" />
          </motion.div>
          <motion.div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-bold text-amber-400/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>1200 → 600</motion.div>
        </div>
      </div>
    </div>
  );
}

const toolVisuals: Record<string, () => React.ReactElement> = {
  "background-remover": BgRemoverVis,
  "pdf-compressor": PdfCompressorVis,
  "pdf-merger": PdfMergerVis,
  "currency-converter": CurrencyVis,
  "compound-interest-calculator": CompoundVis,
  "loan-emi-calculator": LoanVis,
  "resume-builder": ResumeVis,
  "image-compressor": ImageCompressorVis,
  "pdf-to-word": PdfToWordVis,
  "word-counter": WordCounterVis,
  "json-formatter": JsonFormatterVis,
  "image-converter": ImageConverterVis,
  "image-resizer": ImageResizerVis,
};

export function ToolsHub() {
  const tools = [
    {
      id: "background-remover",
      name: "Background Remover",
      description: "Instantly remove backgrounds from images with precision.",
      category: "Image",
      icon: <ImageIcon className="h-6 w-6" />,
      path: "/tools/background-remover"
    },
    {
      id: "pdf-compressor",
      name: "PDF Compressor",
      description: "Reduce PDF file sizes without losing quality.",
      category: "PDF",
      icon: <FileDown className="h-6 w-6" />,
      path: "/tools/pdf-compressor"
    },
    {
      id: "pdf-merger",
      name: "PDF Merger",
      description: "Combine multiple PDF documents into a single file.",
      category: "PDF",
      icon: <FilePlus2 className="h-6 w-6" />,
      path: "/tools/pdf-merger"
    },
    {
      id: "currency-converter",
      name: "Currency Converter",
      description: "Convert between global currencies with up-to-date exchange rates.",
      category: "Finance",
      icon: <ArrowLeftRight className="h-6 w-6" />,
      path: "/tools/currency-converter"
    },
    {
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      description: "Calculate the future value of your investments with regular contributions.",
      category: "Finance",
      icon: <TrendingUp className="h-6 w-6" />,
      path: "/tools/compound-interest-calculator"
    },
    {
      id: "loan-emi-calculator",
      name: "Loan / EMI Calculator",
      description: "Plan your borrowing by calculating monthly payments and total interest.",
      category: "Finance",
      icon: <Landmark className="h-6 w-6" />,
      path: "/tools/loan-emi-calculator"
    },
    {
      id: "resume-builder",
      name: "Resume Builder",
      description: "Create a premium, ATS-friendly resume and download a polished template.",
      category: "Career",
      icon: <FileUser className="h-6 w-6" />,
      path: "/tools/resume-builder"
    },
    {
      id: "image-compressor",
      name: "Image Compressor",
      description: "Reduce image file sizes with adjustable quality — JPG, PNG, WebP supported.",
      category: "Image",
      icon: <ImageDown className="h-6 w-6" />,
      path: "/tools/image-compressor"
    },
    {
      id: "pdf-to-word",
      name: "PDF to Word",
      description: "Extract text from any PDF and download it as an editable document.",
      category: "PDF",
      icon: <FileOutput className="h-6 w-6" />,
      path: "/tools/pdf-to-word"
    },
    {
      id: "word-counter",
      name: "Word Counter",
      description: "Count words, characters, sentences, paragraphs and estimate reading time.",
      category: "Text",
      icon: <Type className="h-6 w-6" />,
      path: "/tools/word-counter"
    },
    {
      id: "json-formatter",
      name: "JSON Formatter",
      description: "Pretty-print or minify any JSON string. Validates syntax instantly.",
      category: "Dev",
      icon: <Braces className="h-6 w-6" />,
      path: "/tools/json-formatter"
    },
    {
      id: "image-converter",
      name: "Image Converter",
      description: "Convert images between JPG, PNG, WebP, BMP and more — bulk conversion in-browser.",
      category: "Image",
      icon: <ArrowRightLeft className="h-6 w-6" />,
      path: "/tools/image-converter"
    },
    {
      id: "image-resizer",
      name: "Image Resizer",
      description: "Resize images to exact pixel dimensions or a percentage. Aspect ratio lock included.",
      category: "Image",
      icon: <Maximize2 className="h-6 w-6" />,
      path: "/tools/image-resizer"
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-amber-300/30 selection:text-white">
      <SEOHead
        title="Free Online Tools — PDF, Image & Productivity Utilities"
        description="Free browser-based tools: PDF compressor, merger, converter, image background remover, resizer, compressor, word counter, JSON formatter and more."
        canonical="/tools"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <RevealOnScroll className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-medium uppercase tracking-widest mb-8">
            Tools Hub
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
            Professional tools for <span className="text-amber-400">every workflow</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            A curated collection of professional utilities designed to solve specific problems efficiently.
            No clutter, just tools that work.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, i) => (
            <RevealOnScroll key={tool.id} delay={Math.min(i * 0.05, 0.35)} className="h-full">
            <Link to={tool.path} className="group glass-panel rounded-3xl p-8 flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:bg-amber-500/[0.03] hover:border-amber-500/20">
              <div className="flex items-center justify-between mb-8">
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400/70 group-hover:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                  {tool.icon}
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-500/10 bg-amber-500/5 px-3 py-1 text-xs font-medium text-amber-400/60 uppercase tracking-widest">
                  {tool.category}
                </span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4">{tool.name}</h3>
              <p className="text-white/50 mb-10 flex-1 font-light leading-relaxed">{tool.description}</p>
              <div className="flex items-center text-sm font-medium text-amber-400/50 group-hover:text-amber-400 transition-colors uppercase tracking-widest mt-auto">
                Launch Tool <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
            </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </div>
  );
}
