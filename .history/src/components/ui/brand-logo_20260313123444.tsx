import { useState } from "react";

interface BrandLogoProps {
  src: string;
  name: string;
  className?: string;
  /** Accent colour for the fallback glow ring (Tailwind colour class suffix, e.g. "emerald") */
  accent?: string;
}

/* ── Gradient map: deterministic per brand name ────────────────────── */

const GRADIENT_PAIRS: [string, string][] = [
  ["#059669", "#0d9488"],
  ["#7c3aed", "#9333ea"],
  ["#0284c7", "#2563eb"],
  ["#d97706", "#ea580c"],
  ["#e11d48", "#db2777"],
  ["#4f46e5", "#1d4ed8"],
  ["#0891b2", "#0d9488"],
  ["#c026d3", "#9333ea"],
];

function getPair(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return GRADIENT_PAIRS[Math.abs(h) % GRADIENT_PAIRS.length];
}

/**
 * Premium brand logo with a rich fallback.
 * - Attempts Clearbit logo first.
 * - On failure → gradient monogram with decorative ring + subtle
 *   radial glow background, sized to match its container.
 */
export function BrandLogo({ src, name, className = "", accent }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    const [c1, c2] = getPair(name);
    const initials = name
      .split(/[\s\-()]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("");

    return (
      <div
        className={`${className} relative flex items-center justify-center select-none overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          boxShadow: `0 0 24px ${c1}40, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* Decorative ring */}
        <div
          className="absolute inset-[3px] rounded-[inherit] border border-white/10"
          style={{ borderRadius: "inherit" }}
        />
        {/* Initials */}
        <span className="relative text-white font-bold tracking-wide drop-shadow-sm"
          style={{ fontSize: "clamp(0.75rem, 40%, 1.5rem)" }}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
