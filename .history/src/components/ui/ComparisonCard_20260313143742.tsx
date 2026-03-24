/**
 * ComparisonCard — Reusable premium comparison card.
 *
 * Wraps the common pattern used across all 7 comparison pages:
 *   • Ranked badge (gold gradient for #1, theme colour otherwise)
 *   • Large BrandImage tile with optional hero glow for #1
 *   • Name / tagline / metadata area
 *   • Pros grid
 *   • Optional highlight box (e.g. "Welcome Offer")
 *   • Action buttons
 *
 * Each page passes its theme colour via the `accent` prop
 * (Tailwind colour suffix: "emerald", "amber", etc.)
 */

import { type ReactNode } from "react";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { BrandImage } from "@/src/components/ui/BrandImage";

/* ── Accent colour tokens ──────────────────────────────────────────── */

const ACCENT = {
  emerald: {
    border: "border-emerald-500/10 hover:border-emerald-500/20",
    badge:  "bg-emerald-500",
    ring:   "ring-emerald-400/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    check:  "text-emerald-400",
    btnBg:  "bg-emerald-600 hover:bg-emerald-500 text-white",
    btnOut: "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10",
    highlight: "bg-emerald-500/5 border-emerald-500/10",
    highlightLabel: "text-emerald-400",
  },
  amber: {
    border: "border-amber-500/10 hover:border-amber-500/20",
    badge:  "bg-amber-500",
    ring:   "ring-amber-400/30 shadow-[0_0_30px_rgba(217,119,6,0.15)]",
    check:  "text-amber-400",
    btnBg:  "bg-amber-600 hover:bg-amber-500 text-white",
    btnOut: "border-amber-500/30 text-amber-400 hover:bg-amber-500/10",
    highlight: "bg-amber-500/5 border-amber-500/10",
    highlightLabel: "text-amber-400",
  },
  indigo: {
    border: "border-indigo-500/10 hover:border-indigo-500/20",
    badge:  "bg-indigo-500",
    ring:   "ring-indigo-400/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]",
    check:  "text-indigo-400",
    btnBg:  "bg-indigo-600 hover:bg-indigo-500 text-white",
    btnOut: "border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10",
    highlight: "bg-indigo-500/5 border-indigo-500/10",
    highlightLabel: "text-indigo-400",
  },
  sky: {
    border: "border-sky-500/10 hover:border-sky-500/20",
    badge:  "bg-sky-500",
    ring:   "ring-sky-400/30 shadow-[0_0_30px_rgba(14,165,233,0.15)]",
    check:  "text-sky-400",
    btnBg:  "bg-sky-600 hover:bg-sky-500 text-white",
    btnOut: "border-sky-500/30 text-sky-400 hover:bg-sky-500/10",
    highlight: "bg-sky-500/5 border-sky-500/10",
    highlightLabel: "text-sky-400",
  },
  violet: {
    border: "border-violet-500/10 hover:border-violet-500/20",
    badge:  "bg-violet-500",
    ring:   "ring-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    check:  "text-violet-400",
    btnBg:  "bg-violet-600 hover:bg-violet-500 text-white",
    btnOut: "border-violet-500/30 text-violet-400 hover:bg-violet-500/10",
    highlight: "bg-violet-500/5 border-violet-500/10",
    highlightLabel: "text-violet-400",
  },
  rose: {
    border: "border-rose-500/10 hover:border-rose-500/20",
    badge:  "bg-rose-500",
    ring:   "ring-rose-400/30 shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    check:  "text-rose-400",
    btnBg:  "bg-rose-600 hover:bg-rose-500 text-white",
    btnOut: "border-rose-500/30 text-rose-400 hover:bg-rose-500/10",
    highlight: "bg-rose-500/5 border-rose-500/10",
    highlightLabel: "text-rose-400",
  },
} as const;

export type AccentColor = keyof typeof ACCENT;

/* ── Props ─────────────────────────────────────────────────────────── */

interface ComparisonCardProps {
  /** 0-based index (used for rank badge) */
  index: number;
  /** Brand display name — resolved via brand registry */
  brandName: string;
  /** Card / product title */
  title: string;
  /** Short tagline */
  tagline: string;
  /** Theme accent colour */
  accent: AccentColor;
  /** Array of pro/feature bullet strings */
  pros: string[];
  /** Metadata key-value pairs shown in the sidebar */
  meta?: { label: string; value: string; emphasize?: boolean }[];
  /** Optional highlight box (e.g. "Welcome Offer") */
  highlight?: { label: string; text: string };
  /** Optional subtitle above the title (e.g. issuer name) */
  subtitle?: string;
  /** Primary CTA */
  primaryAction: { label: string; href: string };
  /** Secondary CTA */
  secondaryAction?: { label: string; href: string };
  /** Extra content (rarely used) */
  children?: ReactNode;
}

export function ComparisonCard({
  index,
  brandName,
  title,
  tagline,
  accent,
  pros,
  meta,
  highlight,
  subtitle,
  primaryAction,
  secondaryAction,
  children,
}: ComparisonCardProps) {
  const tok = ACCENT[accent];
  const rank = index + 1;
  const isHero = index === 0;

  return (
    <div
      className={`glass-panel rounded-3xl p-8 md:p-10 border transition-colors ${tok.border}`}
    >
      {/* ── Header row ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-start gap-6">
          {/* Brand image + rank badge */}
          <div className="relative shrink-0">
            <div
              className={`absolute -top-3 -left-3 z-10 flex items-center justify-center rounded-full text-xs font-bold text-white shadow-lg ${
                isHero
                  ? "w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-600 ring-2 ring-yellow-400/40"
                  : `w-8 h-8 ${tok.badge}`
              }`}
            >
              {rank}
            </div>
            <div
              className={`rounded-2xl ${
                isHero ? `ring-2 ${tok.ring}` : ""
              }`}
            >
              <BrandImage
                name={brandName}
                className="w-24 h-24 rounded-2xl bg-white/95 object-contain"
              />
            </div>
          </div>

          {/* Title block */}
          <div>
            {subtitle && (
              <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${tok.highlightLabel}/70`}>
                {subtitle}
              </p>
            )}
            <h3 className="text-2xl font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-white/50 font-light">{tagline}</p>
          </div>
        </div>

        {/* Metadata sidebar */}
        {meta && meta.length > 0 && (
          <div className="flex flex-col gap-2 md:items-end shrink-0">
            {meta.map((m) => (
              <span key={m.label} className="text-sm text-white/40">
                {m.label}:{" "}
                <span
                  className={
                    m.emphasize
                      ? `${tok.highlightLabel} font-semibold text-base`
                      : "text-white font-medium"
                  }
                >
                  {m.value}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Highlight box (optional) ─────────────────────────────── */}
      {highlight && (
        <div
          className={`border rounded-2xl p-5 mb-8 ${tok.highlight}`}
        >
          <p className="text-sm text-white/70 font-light">
            <span className={`${tok.highlightLabel} font-medium`}>
              {highlight.label}:{" "}
            </span>
            {highlight.text}
          </p>
        </div>
      )}

      {/* ── Pros grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {pros.map((pro) => (
          <div key={pro} className="flex items-start gap-3">
            <Check className={`h-4 w-4 mt-0.5 shrink-0 ${tok.check}`} />
            <p className="text-sm text-white/70 font-light">{pro}</p>
          </div>
        ))}
      </div>

      {/* ── Extra content ────────────────────────────────────────── */}
      {children}

      {/* ── Action buttons ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4">
        <Button
          asChild
          className={`rounded-full px-8 h-11 ${tok.btnBg}`}
        >
          <a
            href={primaryAction.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {primaryAction.label}
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </Button>
        {secondaryAction && (
          <Button
            asChild
            variant="outline"
            className={`rounded-full px-8 h-11 ${tok.btnOut}`}
          >
            <a
              href={secondaryAction.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {secondaryAction.label}
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
