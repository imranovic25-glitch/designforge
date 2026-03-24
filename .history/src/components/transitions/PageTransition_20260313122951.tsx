/**
 * DesignForge360 — Premium Sideways Liquid Page Transition
 * ═══════════════════════════════════════════════════════════
 *
 * Architecture
 * ────────────
 * Three overlapping SVG-clipped layers sweep RIGHT → LEFT across the
 * viewport at staggered timings, producing a viscous liquid ribbon
 * effect. Each layer uses a different organic SVG path for its
 * clip-path, creating a natural curved leading edge instead of a
 * straight wipe.
 *
 * Layer 1 – FRONT (leading dark wave)
 *   Fastest. Arrives first, leaves first. Sharp organic edge.
 *   clip-path: a vertically wavy bezier curve along the leading side.
 *
 * Layer 2 – BODY (deep color fill)
 *   Follows ~60 ms behind layer 1. The primary colour carrier.
 *   Slightly different wave frequency for organic depth.
 *
 * Layer 3 – TRAIL (blurred glow)
 *   Slowest. Arrives last, leaves last. Carries a CSS blur that
 *   softens the trailing edge into a glow. Creates drag & viscosity.
 *
 * The clip-path for each layer defines the organic edge as an SVG
 * polygon that includes a multi-segment cubic Bézier curve on the
 * leading side. As the layer translates from x: 100% → 0 → -100%,
 * the static curve inside the moving layer produces the illusion of
 * a fluid sideways sweep without runtime path morphing (which would
 * be expensive).
 *
 * Route awareness
 * ───────────────
 * `TransitionMode` dictates the gradient palette per layer:
 *   normal → finance  ▸ dark front → emerald body → green glow
 *   finance → normal  ▸ green front → dark body → navy glow
 *   normal → normal   ▸ all dark navy tones
 *   finance → finance ▸ subtle dark-emerald blend
 *
 * Customisation
 * ─────────────
 * • DURATION       — total sweep time (default 0.75 s)
 * • EASE           — cubic-bezier for the translateX keyframes
 * • PALETTES       — gradient strings per mode × layer
 * • WAVE_PATHS     — SVG polygon strings for each layer's clip-path
 * • AnimatedPage   — content delay & slide direction
 *
 * Accessibility
 * ─────────────
 * prefers-reduced-motion → simple 300 ms opacity fade, no transforms.
 */

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TransitionMode } from "@/src/lib/route-utils";

/* ───────────────────────────── Timing ─────────────────────────────── */

const DURATION = 0.75;
const EASE: [number, number, number, number] = [0.77, 0, 0.18, 1];

/* ──────────────── SVG clip-path wave definitions ──────────────────── */
/*
 * Each path is a CSS polygon()/path() usable in clip-path.
 * The leading edge (left side, since layers sweep ← ) is a series
 * of cubic bézier curves that produce an organic wavy boundary.
 * The rest of the shape is a simple rectangle (right + top + bottom
 * edges).
 *
 * We define them as SVG `path` `d` attributes inside `clipPath` defs
 * rendered in an invisible SVG, then reference via `clip-path: url(#id)`.
 */

/** Front layer — pronounced wave, 3 lobes */
const WAVE_FRONT =
  "M 0 0 L 0.88 0 C 0.92 0.12, 1.0 0.18, 0.95 0.28 C 0.90 0.38, 1.02 0.42, 0.97 0.52 C 0.92 0.62, 1.0 0.72, 0.95 0.82 C 0.90 0.92, 0.94 1.0, 0.88 1.0 L 0 1 Z";

/** Body layer — gentler wave, 4 lobes, slightly wider */
const WAVE_BODY =
  "M 0 0 L 0.90 0 C 0.96 0.08, 0.92 0.16, 0.96 0.25 C 1.0 0.34, 0.93 0.42, 0.97 0.50 C 1.01 0.58, 0.93 0.66, 0.97 0.75 C 1.01 0.84, 0.94 0.92, 0.90 1.0 L 0 1 Z";

/** Trail layer — soft broad wave */
const WAVE_TRAIL =
  "M 0 0 L 0.85 0 C 0.92 0.15, 1.0 0.30, 0.93 0.50 C 0.86 0.70, 0.98 0.85, 0.85 1.0 L 0 1 Z";

/* ──────────────────────── Colour palettes ─────────────────────────── */

interface LayerPalette {
  front: string;
  body: string;
  trail: string;
}

const PALETTES: Record<TransitionMode, LayerPalette> = {
  "normal-to-finance": {
    front: "#08111f",
    body:  "#0d1f17",
    trail: "#14532d",
  },
  "finance-to-normal": {
    front: "#14532d",
    body:  "#0d1f17",
    trail: "#08111f",
  },
  "normal-to-normal": {
    front: "#08111f",
    body:  "#0B1220",
    trail: "#111827",
  },
  "finance-to-finance": {
    front: "#0d1f17",
    body:  "#14532d",
    trail: "#0d1f17",
  },
};

/* ─────────────────── Clip-path SVG definitions ────────────────────── */

/**
 * Invisible <svg> that holds the three clip-path definitions.
 * Rendered once at the top of the overlay container.
 * Using `objectBoundingBox` so the path coords (0–1) map to the
 * element's own bounding box — automatically responsive.
 */
function ClipDefs() {
  return (
    <svg
      aria-hidden
      className="absolute"
      style={{ width: 0, height: 0, position: "absolute" }}
    >
      <defs>
        <clipPath id="wave-front" clipPathUnits="objectBoundingBox">
          <path d={WAVE_FRONT} />
        </clipPath>
        <clipPath id="wave-body" clipPathUnits="objectBoundingBox">
          <path d={WAVE_BODY} />
        </clipPath>
        <clipPath id="wave-trail" clipPathUnits="objectBoundingBox">
          <path d={WAVE_TRAIL} />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ───────────────────── Transition Overlay ──────────────────────────── */

interface TransitionOverlayProps {
  mode: TransitionMode;
  onComplete: () => void;
}

export function TransitionOverlay({ mode, onComplete }: TransitionOverlayProps) {
  const shouldReduce = useReducedMotion();
  const { front, body, trail } = PALETTES[mode];

  /* Reduced-motion fallback — simple opacity */
  if (shouldReduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ background: body }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.3, times: [0, 0.35, 0.55, 1] }}
        onAnimationComplete={onComplete}
      />
    );
  }

  /*
   * Each layer sweeps from x: 100vw → 0 → -100vw
   * with a hold in the middle (times array).
   * The clip-path gives the leading edge its organic curve.
   */
  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      <ClipDefs />

      {/* Layer 1 — FRONT: leading dark wave */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: front,
          clipPath: "url(#wave-front)",
          willChange: "transform",
        }}
        initial={{ x: "100%" }}
        animate={{ x: ["100%", "0%", "0%", "-100%"] }}
        transition={{
          duration: DURATION,
          times: [0, 0.35, 0.50, 1],
          ease: EASE,
        }}
      />

      {/* Layer 2 — BODY: deep color fill */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: body,
          clipPath: "url(#wave-body)",
          willChange: "transform",
        }}
        initial={{ x: "105%" }}
        animate={{ x: ["105%", "0%", "0%", "-105%"] }}
        transition={{
          duration: DURATION,
          times: [0, 0.38, 0.52, 1],
          ease: EASE,
        }}
      />

      {/* Layer 3 — TRAIL: blurred glow, viscous drag */}
      <motion.div
        className="absolute -inset-8 blur-xl"
        style={{
          background: `linear-gradient(90deg, ${trail}, ${body})`,
          clipPath: "url(#wave-trail)",
          willChange: "transform",
        }}
        initial={{ x: "112%" }}
        animate={{ x: ["112%", "3%", "3%", "-112%"] }}
        transition={{
          duration: DURATION,
          times: [0, 0.42, 0.54, 1],
          ease: EASE,
        }}
        onAnimationComplete={onComplete}
      />
    </div>
  );
}

/* ────────────────────── Animated Page ─────────────────────────────── */

interface AnimatedPageProps {
  children: ReactNode;
}

/**
 * Content wrapper. Fades + slides in from the right after a brief
 * delay so the overlay has begun covering the viewport.
 */
export function AnimatedPage({ children }: AnimatedPageProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: shouldReduce ? 0 : 30,
      }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: shouldReduce ? 0.2 : 0.45,
        delay: shouldReduce ? 0.12 : 0.30,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── Finance Atmosphere Background ───────────────────── */

export function FinanceAtmosphere({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={`fixed inset-0 -z-10 pointer-events-none transition-opacity duration-700 ease-in-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-black to-emerald-950/40" />
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[160px] animate-pulse-slow" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-700/10 blur-[140px] animate-pulse-slow-delayed" />
      <div
        className="absolute inset-0 animate-flow-gradient"
        style={{
          background:
            "linear-gradient(160deg, transparent 30%, rgba(16,185,129,0.04) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
        }}
      />
    </div>
  );
}
