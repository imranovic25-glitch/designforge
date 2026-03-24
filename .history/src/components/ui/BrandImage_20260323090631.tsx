/**
 * BrandImage — Premium brand visual with local SVG + generated fallback.
 *
 * Attempts to load /images/brands/{slug}.svg from the public dir.
 * On failure, renders an inline-SVG branded tile with:
 *   • gradient background using official brand colours
 *   • abbreviation in the centre
 *   • brand name along the bottom
 *   • subtle decorative accent line
 *
 * This ensures every brand tile looks premium — never a bare letter.
 */

import { useState } from "react";
import { getBrand } from "@/src/lib/brand-data";
import { withAssetVersion } from "@/src/lib/public-assets";

interface BrandImageProps {
  /** Display name of the brand (must match brand-data registry). */
  name: string;
  /** Extra Tailwind classes on the outer wrapper. */
  className?: string;
  /**
   * Override the image source. When omitted the component resolves
   * the path automatically via the brand registry slug.
   */
  src?: string;
}

export function BrandImage({ name, className = "", src }: BrandImageProps) {
  const brand = getBrand(name);
  // Always use the local SVG — external URLs (e.g. Clearbit) time-out instead of
  // returning 404, so onError never fires and browsers show a broken-image tile.
  const resolvedSrc = (!src || /^https?:\/\//.test(src))
    ? `/images/brands/${brand.slug}.svg`
    : src;
  const localSrc = resolvedSrc.startsWith("/") ? withAssetVersion(resolvedSrc) : resolvedSrc;
  const [failed, setFailed] = useState(false);

  /* ── Try local SVG asset first ───────────────────────────────── */
  if (!failed) {
    return (
      <img
        src={localSrc}
        alt={`${brand.name} logo`}
        className={className}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  /* ── Premium inline-SVG fallback ─────────────────────────────── */
  return (
    <div className={`${className} overflow-hidden`}>
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        role="img"
        aria-label={`${brand.name} logo`}
      >
        <defs>
          <linearGradient id={`bg-${brand.slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={brand.color1} />
            <stop offset="100%" stopColor={brand.color2} />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="200" height="200" rx="24" fill={`url(#bg-${brand.slug})`} />

        {/* Decorative accent line */}
        <rect x="30" y="52" width="40" height="3" rx="1.5" fill="rgba(255,255,255,0.35)" />

        {/* Abbreviation */}
        <text
          x="100"
          y="112"
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="700"
          fontSize="56"
          letterSpacing="2"
        >
          {brand.abbr}
        </text>

        {/* Brand name at bottom */}
        <text
          x="100"
          y="168"
          textAnchor="middle"
          fill="rgba(255,255,255,0.7)"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="500"
          fontSize="14"
          letterSpacing="0.5"
        >
          {brand.name.length > 22 ? brand.name.slice(0, 20) + "…" : brand.name}
        </text>
      </svg>
    </div>
  );
}
