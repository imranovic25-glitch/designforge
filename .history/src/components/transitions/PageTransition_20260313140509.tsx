/**
 * DesignForge360 — White Bottom-to-Top Page Transition
 * ═══════════════════════════════════════════════════════
 *
 * Five white layers sweep upward (bottom → top) with staggered
 * timing. Each layer has an SVG clip-path that gives the bottom
 * (trailing) edge an organic Bézier curve, creating a cascading
 * liquid-curtain reveal.
 *
 * Architecture
 * ────────────
 * Layout.tsx detects a route change and mounts <TransitionOverlay>.
 * The overlay renders at y=0 % (covering the screen immediately,
 * hiding the content swap beneath). It then animates to y=-100 %
 * (sweeps upward off-screen), revealing the new page underneath
 * with the wavy trailing edge.
 *
 * No AnimatePresence required — the overlay is controlled entirely
 * by a boolean flag in Layout state.
 *
 * Accessibility
 * ─────────────
 * prefers-reduced-motion → instant opacity fade, no transforms.
 */

import { motion, useReducedMotion } from "motion/react";

/* ═══════════════════ Config ═════════════════════════════════════════ */

const DURATION = 0.75;
const STAGGER = 0.03;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Opacity per layer – front (opaque) → back (translucent). */
const OPACITIES = [1, 0.88, 0.74, 0.58, 0.40];

/**
 * SVG paths for the organic trailing edge (bottom of each layer).
 * Coordinates are in objectBoundingBox units (0–1).
 * Each path: top-left → top-right → down right side → wavy bottom → close.
 */
const WAVE_PATHS = [
  "M 0 0 L 1 0 L 1 0.82 C 0.78 0.96, 0.52 0.78, 0.26 0.94 C 0.12 0.99, 0 0.86, 0 0.86 Z",
  "M 0 0 L 1 0 L 1 0.84 C 0.82 0.93, 0.56 0.80, 0.32 0.94 C 0.15 0.98, 0 0.87, 0 0.87 Z",
  "M 0 0 L 1 0 L 1 0.86 C 0.80 0.94, 0.54 0.83, 0.30 0.93 C 0.14 0.97, 0 0.89, 0 0.89 Z",
  "M 0 0 L 1 0 L 1 0.88 C 0.84 0.95, 0.60 0.86, 0.34 0.94 C 0.16 0.97, 0 0.90, 0 0.90 Z",
  "M 0 0 L 1 0 L 1 0.90 C 0.82 0.96, 0.58 0.88, 0.32 0.95 C 0.16 0.98, 0 0.92, 0 0.92 Z",
];

/* ═══════════════════ SVG clip-path definitions ══════════════════════ */

function ClipDefs() {
  return (
    <svg aria-hidden style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        {WAVE_PATHS.map((d, i) => (
          <clipPath key={i} id={`wave-${i}`} clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}

/* ═══════════════════ TransitionOverlay ═══════════════════════════════ */

interface TransitionOverlayProps {
  onComplete: () => void;
}

/**
 * Full-screen white overlay that sweeps bottom → top.
 *
 * Mounts at y=0 % (covering the screen). Animates to y=-100 %
 * (off-screen above), revealing the new content underneath.
 * Five layers are staggered for a cascading liquid effect;
 * each has an SVG clip-path with a Bézier-curved trailing edge.
 */
export function TransitionOverlay({ onComplete }: TransitionOverlayProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-white pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={onComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      <ClipDefs />

      {WAVE_PATHS.map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${OPACITIES[i]})`,
            clipPath: `url(#wave-${i})`,
            willChange: "transform",
          }}
          initial={{ y: "0%" }}
          animate={{ y: "-100%" }}
          transition={{
            duration: DURATION,
            delay: i * STAGGER,
            ease: EASE,
          }}
          onAnimationComplete={
            i === WAVE_PATHS.length - 1 ? onComplete : undefined
          }
        />
      ))}
    </div>
  );
}

/* ═══════════════════ Finance Atmosphere ══════════════════════════════ */

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
