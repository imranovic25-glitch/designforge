import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
import { SEOHead } from "@/src/components/seo/SEOHead";

/* ─── Unique card visuals for each comparison topic ─── */
function CreditCardVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0804,#0a0a0a 60%,#0c0a05)" }}>
      <div className="absolute top-2 right-2 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(245,158,11,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
        {[{ rotate: -8, bg: "linear-gradient(135deg,#fbbf24,#d97706)" }, { rotate: 4, bg: "linear-gradient(135deg,#6366f1,#4f46e5)" }].map((card, i) => (
          <div key={i} className="w-20 h-14 rounded-lg relative overflow-hidden shadow-lg" style={{ transform: `rotate(${card.rotate}deg)`, background: card.bg }}>
            <div className="absolute top-2 left-2 w-4 h-3 rounded-[2px] border border-white/30" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1))" }} />
            <div className="absolute bottom-2 left-2 flex gap-0.5">
              {[...Array(4)].map((_, j) => <div key={j} className="w-4 h-[3px] rounded-full bg-white/20" />)}
            </div>
            <div className="absolute bottom-2 right-2 flex -space-x-1">
              <div className="w-3 h-3 rounded-full bg-white/30" /><div className="w-3 h-3 rounded-full bg-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetingVis() {
  const segments = [
    { pct: 35, color: "rgba(16,185,129,0.8)" },
    { pct: 25, color: "rgba(99,102,241,0.8)" },
    { pct: 22, color: "rgba(245,158,11,0.8)" },
    { pct: 18, color: "rgba(236,72,153,0.7)" },
  ];
  let offset = 0;
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#05060d,#0a0a0a 60%,#06050c)" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 80 80">
          {segments.map((s, i) => {
            const dash = (s.pct / 100) * 201;
            const gap = 201 - dash;
            const o = offset;
            offset += dash;
            return <circle key={i} cx="40" cy="40" r="32" fill="none" stroke={s.color} strokeWidth="10" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-o} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${s.color})` }} />;
          })}
          <text x="40" y="38" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">$2.4K</text>
          <text x="40" y="48" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">Monthly</text>
        </svg>
      </div>
    </div>
  );
}

function InvestingVis() {
  const bars = [
    { h: 20, up: true }, { h: 14, up: false }, { h: 28, up: true },
    { h: 16, up: false }, { h: 34, up: true }, { h: 40, up: true },
  ];
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#040d08,#0a0a0a 60%,#040b07)" }}>
      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-end justify-center pb-6 px-8 gap-2">
        {bars.map((b, i) => (
          <div key={i} className="flex-1 rounded-sm" style={{ height: b.h, background: b.up ? "linear-gradient(180deg,rgba(16,185,129,0.85),rgba(5,150,105,0.4))" : "linear-gradient(180deg,rgba(239,68,68,0.75),rgba(220,38,38,0.35))", boxShadow: b.up ? "0 0 6px rgba(16,185,129,0.25)" : "none" }} />
        ))}
      </div>
      <div className="absolute top-3 right-4 text-[10px] font-bold text-emerald-400">+12.4%</div>
    </div>
  );
}

function SavingsVis() {
  const points = [40, 36, 38, 30, 24, 18, 12];
  const w = 140, h = 50;
  const step = w / (points.length - 1);
  const d = points.map((y, i) => `${i === 0 ? "M" : "L"}${i * step},${y}`).join(" ");
  const areaD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#04080d,#0a0a0a 60%,#040a0d)" }}>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(59,130,246,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
          <defs>
            <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0)" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#savGrad)" />
          <path d={d} fill="none" stroke="rgba(59,130,246,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={w} cy={points[points.length - 1]} r="3" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px rgba(59,130,246,0.6))" }} />
        </svg>
      </div>
      <div className="absolute top-3 left-4 text-[10px] font-bold text-blue-400">5.25% APY</div>
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
          <div className="space-y-1">
            {[70, 55, 65, 45].map((w, i) => <div key={i} className="h-[2px] rounded-full bg-purple-400/15" style={{ width: `${w}%` }} />)}
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white" style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>A+</div>
        </div>
      </div>
    </div>
  );
}

function AiWritingVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0c0618,#0a0a0a 60%,#080612)" }}>
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(139,92,246,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8">
        <div className="w-full flex items-center gap-1.5 mb-1">
          <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <svg width="6" height="6" viewBox="0 0 8 8" fill="white"><path d="M4 0.5L5.8 3.5L4 6.5L2.2 3.5Z" /></svg>
          </div>
          <span className="text-[8px] font-bold tracking-wider uppercase text-violet-300/50">AI Writer</span>
        </div>
        {[85, 70, 60, 45].map((w, i) => (
          <div key={i} className={`h-[3px] rounded-full self-start ${i === 0 ? "bg-violet-400/60" : "bg-white/10"}`} style={{ width: `${w}%` }} />
        ))}
        <div className="self-start flex items-center gap-1 mt-1">
          <span className="text-[8px] font-bold text-emerald-400">Score: 96</span>
          <div className="w-8 h-1 rounded-full bg-white/5 overflow-hidden"><div className="h-full w-[82%] rounded-full" style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)" }} /></div>
        </div>
      </div>
    </div>
  );
}

function BgRemoverVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0408,#0a0a0a 60%,#0c050a)" }}>
      <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(244,63,94,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 relative">
          {/* Checkerboard left half */}
          <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: "inset(0 50% 0 0)" }}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              {[...Array(12)].map((_, r) => [...Array(12)].map((_, c) => (
                <rect key={`${r}-${c}`} x={c * 8} y={r * 8} width="8" height="8" fill={(r + c) % 2 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"} />
              )))}
            </svg>
          </div>
          {/* Person silhouette on right */}
          <div className="absolute inset-0 overflow-hidden rounded-lg" style={{ clipPath: "inset(0 0 0 50%)" }}>
            <div className="w-full h-full" style={{ background: "linear-gradient(160deg,rgba(244,63,94,0.1),rgba(251,113,133,0.05))" }} />
          </div>
          {/* Center divider */}
          <div className="absolute top-0 bottom-0 left-1/2 w-[2px]" style={{ background: "linear-gradient(180deg,transparent,rgba(244,63,94,0.6),transparent)" }} />
          {/* Person icon */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width="24" height="30" viewBox="0 0 24 30" fill="none">
            <circle cx="12" cy="7" r="5" fill="rgba(244,63,94,0.3)" stroke="rgba(244,63,94,0.5)" strokeWidth="1" />
            <path d="M2 28C2 20 6 16 12 16C18 16 22 20 22 28" fill="rgba(244,63,94,0.2)" stroke="rgba(244,63,94,0.4)" strokeWidth="1" />
          </svg>
          {/* AI badge */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[7px] font-bold text-white" style={{ background: "linear-gradient(135deg,#f43f5e,#e11d48)" }}>AI Remove</div>
        </div>
      </div>
    </div>
  );
}

function ImageResizerVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0a04,#0a0a0a 60%,#0c0804)" }}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer frame */}
          <div className="w-24 h-20 rounded-lg border border-amber-500/20 bg-amber-500/[0.04]" style={{ boxShadow: "0 0 12px rgba(245,158,11,0.1)" }}>
            <div className="absolute top-1 left-1 w-3 h-3">
              <div className="w-full h-[2px] bg-amber-500/40" /><div className="h-full w-[2px] bg-amber-500/40" />
            </div>
          </div>
          {/* Inner frame (resized) */}
          <div className="absolute top-3 left-3 w-14 h-10 rounded border border-sky-400/30 bg-sky-400/[0.06]" style={{ boxShadow: "0 0 8px rgba(56,189,248,0.15)" }}>
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-[2px] border border-sky-400/60 bg-sky-400/20" />
          </div>
          {/* Arrow */}
          <svg className="absolute -right-4 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M7 3L10 6L7 9" stroke="rgba(245,158,11,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold text-amber-400/60">1200 → 600px</div>
        </div>
      </div>
    </div>
  );
}

function PdfConverterVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#04060d,#0a0a0a 60%,#050810)" }}>
      <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(99,102,241,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-6">
        {/* PDF doc */}
        <div className="w-14 h-18 rounded-md border border-red-500/25 bg-red-500/[0.06] flex flex-col items-center justify-center gap-1 relative">
          <div className="text-[9px] font-bold text-red-400">PDF</div>
          {[60, 45, 55].map((w, i) => <div key={i} className="h-[2px] rounded-full bg-white/8" style={{ width: `${w}%` }} />)}
        </div>
        {/* Arrow */}
        <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
          <path d="M0 6H16M13 2L17 6L13 10" stroke="rgba(99,102,241,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Word doc */}
        <div className="w-14 h-18 rounded-md border border-indigo-500/25 bg-indigo-500/[0.06] flex flex-col items-center justify-center gap-1" style={{ boxShadow: "0 0 10px rgba(99,102,241,0.15)" }}>
          <div className="text-[9px] font-bold text-indigo-400">DOC</div>
          {[55, 65, 45].map((w, i) => <div key={i} className="h-[2px] rounded-full bg-indigo-400/15" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    </div>
  );
}

function PdfEditorVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0a0408,#0a0a0a 60%,#0c060a)" }}>
      <div className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(236,72,153,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-32 rounded-lg border border-pink-500/15 bg-white/[0.02] p-2 relative">
          {/* Toolbar */}
          <div className="flex gap-1 mb-2 pb-1 border-b border-pink-500/10">
            {["T", "✎", "◻"].map((t, i) => (
              <div key={i} className="w-4 h-4 rounded text-[7px] flex items-center justify-center text-pink-400/50 bg-pink-500/[0.06]">{t}</div>
            ))}
          </div>
          {/* Text lines */}
          <div className="space-y-1.5">
            {[70, 55, 65, 40, 60].map((w, i) => (
              <div key={i} className={`h-[2px] rounded-full ${i === 1 ? "bg-pink-400/30" : "bg-white/8"}`} style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* Highlight box */}
          <div className="absolute top-14 left-2 right-4 h-3 rounded border border-pink-400/25 bg-pink-500/[0.08]" />
          {/* Cursor */}
          <div className="absolute top-[52px] left-[38%] w-[1.5px] h-3 bg-pink-400 rounded-full" style={{ boxShadow: "0 0 4px rgba(236,72,153,0.4)" }} />
        </div>
      </div>
    </div>
  );
}

function PasswordManagerVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#080d04,#0a0a0a 60%,#060b04)" }}>
      <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(34,197,94,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-24 rounded-xl border border-green-500/20 bg-green-500/[0.04] p-3 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-green-500/40 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(34,197,94,0.7)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div className="flex gap-0.5">
              {[...Array(8)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400/40" />)}
            </div>
            <div className="w-12 h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full w-[90%] rounded-full bg-green-500/50" /></div>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px]" style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function QrCodeVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0d0d04,#0a0a0a 60%,#0c0a04)" }}>
      <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(251,191,36,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 p-1.5 rounded-lg border border-amber-500/20 bg-white/[0.03]">
          <svg viewBox="0 0 7 7" className="w-full h-full">
            {/* QR corner patterns */}
            {[[0,0],[0,4],[4,0]].map(([x,y], i) => (
              <g key={i}>
                <rect x={x} y={y} width="3" height="3" fill="none" stroke="rgba(251,191,36,0.5)" strokeWidth="0.3" rx="0.2" />
                <rect x={x+0.7} y={y+0.7} width="1.6" height="1.6" fill="rgba(251,191,36,0.4)" rx="0.15" />
              </g>
            ))}
            {/* Data modules */}
            {[[3.5,0.5],[4,1.5],[3,2],[5,2.5],[3.5,3],[1,3.5],[2.5,3.5],[5.5,3.5],[4.5,4.5],[5.5,5],[4,5.5],[5.5,6],[6,4]].map(([x,y], i) => (
              <rect key={i} x={x} y={y} width="0.7" height="0.7" fill="rgba(251,191,36,0.3)" rx="0.1" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

function ColorPaletteVis() {
  const colors = ["#f43f5e", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#0c0612,#0a0a0a 60%,#080510)" }}>
      <div className="absolute top-0 right-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(139,92,246,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-8">
        {colors.map((c, i) => (
          <div key={i} className="flex-1 h-16 rounded-lg" style={{ background: c, opacity: 0.6, boxShadow: `0 4px 12px ${c}40` }} />
        ))}
      </div>
    </div>
  );
}

function MarkdownEditorVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#04060d,#0a0a0a 60%,#050810)" }}>
      <div className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(56,189,248,0.18) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-6">
        {/* Editor side */}
        <div className="w-20 h-20 rounded-lg border border-sky-500/15 bg-white/[0.02] p-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1"><div className="text-[8px] font-bold text-sky-400/60">#</div><div className="h-[2px] flex-1 rounded bg-sky-400/30" /></div>
          {[65, 50, 70, 40].map((w, i) => <div key={i} className="h-[2px] rounded-full bg-white/8" style={{ width: `${w}%` }} />)}
          <div className="flex items-center gap-1 mt-1"><div className="text-[6px] text-sky-400/40">**</div><div className="h-[2px] w-8 rounded bg-sky-400/20" /><div className="text-[6px] text-sky-400/40">**</div></div>
        </div>
        {/* Divider */}
        <div className="h-14 w-px bg-sky-400/15" />
        {/* Preview side */}
        <div className="w-20 h-20 rounded-lg border border-sky-500/10 bg-sky-500/[0.02] p-2 flex flex-col gap-1.5">
          <div className="h-[3px] w-12 rounded bg-sky-400/40" />
          {[60, 55, 65, 35].map((w, i) => <div key={i} className="h-[2px] rounded-full bg-white/10" style={{ width: `${w}%` }} />)}
          <div className="h-[3px] w-10 rounded bg-sky-400/25 mt-1" />
        </div>
      </div>
    </div>
  );
}

function MortgageVis() {
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(160deg,#040d08,#0a0a0a 60%,#040b07)" }}>
      <div className="absolute top-0 left-0 w-40 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse,rgba(16,185,129,0.2) 0%,transparent 70%)", filter: "blur(24px)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="8" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(16,185,129,0.7)" strokeWidth="8" strokeDasharray="110 54" strokeLinecap="round" transform="rotate(-90 32 32)" />
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="8" strokeDasharray="30 134" strokeLinecap="round" transform="rotate(110 32 32)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-emerald-400">$1,842</span>
            <span className="text-[7px] text-white/30">/month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardVisuals: Record<string, () => React.ReactElement> = {
  "best-credit-cards": CreditCardVis,
  "best-budgeting-apps": BudgetingVis,
  "best-investing-apps": InvestingVis,
  "best-savings-accounts": SavingsVis,
  "best-resume-builders": ResumeVis,
  "best-ai-writing-tools": AiWritingVis,
  "best-ai-background-remover-tools": BgRemoverVis,
  "best-image-resizer-tools": ImageResizerVis,
  "best-pdf-converters": PdfConverterVis,
  "best-pdf-editors": PdfEditorVis,
  "best-password-managers": PasswordManagerVis,
  "best-qr-code-generators": QrCodeVis,
  "best-color-palette-tools": ColorPaletteVis,
  "best-markdown-editors": MarkdownEditorVis,
  "best-mortgage-calculators": MortgageVis,
};

export function ComparisonsHub() {
  const comparisons = [
    {
      id: "best-credit-cards",
      title: "Best Credit Cards",
      description: "Compare top cards for rewards, travel, and cash back to maximize your spending.",
      category: "Finance",
      path: "/comparisons/best-credit-cards"
    },
    {
      id: "best-budgeting-apps",
      title: "Best Budgeting Apps",
      description: "Top tools to track spending, manage your money, and reach your financial goals.",
      category: "Finance",
      path: "/comparisons/best-budgeting-apps"
    },
    {
      id: "best-investing-apps",
      title: "Best Investing Apps",
      description: "Platforms for beginners and advanced traders looking to build wealth.",
      category: "Finance",
      path: "/comparisons/best-investing-apps"
    },
    {
      id: "best-savings-accounts",
      title: "Best Savings Accounts",
      description: "High-yield options to keep your emergency fund safe and growing.",
      category: "Finance",
      path: "/comparisons/best-savings-accounts"
    },
    {
      id: "best-resume-builders",
      title: "Best Resume Builders",
      description: "We compared the top resume builders to find which ones actually help you land interviews.",
      category: "Career",
      path: "/comparisons/best-resume-builders"
    },
    {
      id: "best-ai-writing-tools",
      title: "Best AI Writing Tools",
      description: "An editorial review of the top AI writing assistants for content creators and professionals.",
      category: "Productivity",
      path: "/comparisons/best-ai-writing-tools"
    },
    {
      id: "best-ai-background-remover-tools",
      title: "Best AI Background Removers",
      description: "Which tool isolates subjects best? We tested the top options for speed and accuracy.",
      category: "Design",
      path: "/comparisons/best-ai-background-remover-tools"
    },
    {
      id: "best-image-resizer-tools",
      title: "Best Image Resizer Tools",
      description: "The top tools for resizing, compressing, and converting images — from quick browser tools to powerful batch processors.",
      category: "Design",
      path: "/comparisons/best-image-resizer-tools"
    },
    {
      id: "best-pdf-converters",
      title: "Best PDF Converters",
      description: "Convert PDFs to Word, Excel, PowerPoint, and images with ease. We compared the top tools for accuracy and speed.",
      category: "Productivity",
      path: "/comparisons/best-pdf-converters"
    },
    {
      id: "best-pdf-editors",
      title: "Best PDF Editors",
      description: "Edit, annotate, sign, and manage PDFs like a pro. Desktop, mobile, and browser-based options compared.",
      category: "Productivity",
      path: "/comparisons/best-pdf-editors"
    },
    {
      id: "best-password-managers",
      title: "Best Password Managers",
      description: "Keep your accounts secure with the top password managers for individuals and teams.",
      category: "Security",
      path: "/comparisons/best-password-managers"
    },
    {
      id: "best-qr-code-generators",
      title: "Best QR Code Generators",
      description: "Create custom QR codes for links, Wi-Fi, and vCards. We compared the top free and paid options.",
      category: "Utility",
      path: "/comparisons/best-qr-code-generators"
    },
    {
      id: "best-color-palette-tools",
      title: "Best Color Palette Tools",
      description: "Generate harmonious color schemes for your designs. Side-by-side comparison of the top palette generators.",
      category: "Design",
      path: "/comparisons/best-color-palette-tools"
    },
    {
      id: "best-markdown-editors",
      title: "Best Markdown Editors",
      description: "Write and preview Markdown effortlessly. We reviewed the best editors for developers and writers.",
      category: "Dev",
      path: "/comparisons/best-markdown-editors"
    },
    {
      id: "best-mortgage-calculators",
      title: "Best Mortgage Calculators",
      description: "Compare the top mortgage tools to estimate payments, rates, and total cost of homeownership.",
      category: "Finance",
      path: "/comparisons/best-mortgage-calculators"
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-orange-300/30 selection:text-white">
      <SEOHead
        title="Expert Product Comparisons — Tools, Apps & Financial Products"
        description="Independent editorial comparisons of the best PDF editors, AI writing tools, credit cards, investing apps, and more — researched and ranked for 2026."
        canonical="/comparisons"
      />
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <RevealOnScroll className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-medium uppercase tracking-widest mb-8">
            Editorial Comparisons
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
            Expert picks to help you <span className="text-orange-400">choose smarter</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            In-depth analysis and side-by-side comparisons to help you choose the right tools, apps, and services for your needs.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comparisons.map((comp, i) => {
            const Visual = cardVisuals[comp.id];
            return (
            <RevealOnScroll key={comp.id} delay={Math.min(i * 0.05, 0.35)} className="h-full">
            <Link to={comp.path} className="group glass-panel rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:bg-orange-500/[0.03] hover:border-orange-500/20">
              <div className="h-48 relative overflow-hidden rounded-t-3xl">
                {Visual ? <Visual /> : <div className="w-full h-full bg-orange-500/5" />}
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="text-xs font-medium text-orange-400/50 mb-4 uppercase tracking-widest">{comp.category}</div>
                <h3 className="text-2xl font-medium text-white mb-4">{comp.title}</h3>
                <p className="text-white/50 mb-8 flex-1 font-light leading-relaxed">{comp.description}</p>
                <div className="flex items-center text-sm font-medium text-orange-400/50 group-hover:text-orange-400 transition-colors uppercase tracking-widest mt-auto">
                  Read Comparison <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>            </RevealOnScroll>
          );
          })}
        </div>
      </div>
    </div>
  );
}
