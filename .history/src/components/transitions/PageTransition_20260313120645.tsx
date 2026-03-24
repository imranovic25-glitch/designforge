/**
 * Premium page-transition system for DesignForge360.
 *
 * Architecture
 * ────────────
 * 1. TransitionOverlay  – full-screen liquid sweep that fires on every
 *    route change. Two gradient layers slide bottom → top at slightly
 *    offset speeds, producing a layered organic veil. The second layer
 *    carries a heavy blur which softens the leading edge into a liquid
 *    impression. Gradient palettes adapt to the transition mode
 *    (normal↔finance).
 *
 * 2. AnimatedPage – wraps <Outlet /> with a keyed motion.div that
 *    fades + slides content in after the overlay has covered the
 *    previous page. Because React Router swaps the outlet immediately,
 *    the overlay visually masks the instant swap; the new content
 *    reveals itself as the overlay sweeps away.
 *
 * 3. FinanceAtmosphere – persistent background layer with emerald
 *    radial-glow orbs that transitions in/out via CSS opacity based
 *    on whether the current route is classified as "finance".
 *
 * Accessibility: prefers-reduced-motion falls back to a fast opacity
 * fade with no transform movement.
 *
 * Customisation
 * ─────────────
 * • Colors   — edit `PALETTES` object below (main sweep gradient +
 *              blur accent gradient per mode).
 * • Speed    — edit DURATION constant (default 0.65 s).
 * • Easing   — edit SWEEP_EASE cubic-bezier array.
 * • Content  — edit AnimatedPage delay / y-offset.
 */

import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TransitionMode } from "@/src/lib/route-utils";

/* ───────────────────────────── Config ─────────────────────────────── */

/** Total overlay sweep duration (seconds). 0.6 – 0.8 feels premium. */
const DURATION = 0.65;

/** Cubic-bezier for the sweep layers. Aggressive ease-in-out. */
const SWEEP_EASE: [number, number, number, number] = [0.86, 0, 0.07, 1];

/** Gradient palettes per transition mode. */
const PALETTES: Record<TransitionMode, { main: string; soft: string }> = {
  "normal-to-finance": {
    main: "linear-gradient(160deg, #08111f 0%, #0d1f17 40%, #14532d 100%)",
    soft: "linear-gradient(160deg, #0d1f17 0%, #14532d 50%, rgba(22,163,74,0.25) 100%)",
  },
  "finance-to-normal": {
    main: "linear-gradient(160deg, #14532d 0%, #0d1f17 40%, #08111f 100%)",
    soft: "linear-gradient(160deg, rgba(22,163,74,0.15) 0%, #0d1f17 50%, #08111f 100%)",
  },
  "normal-to-normal": {
    main: "linear-gradient(160deg, #08111f 0%, #0B1220 50%, #111827 100%)",
    soft: "linear-gradient(160deg, #0B1220 0%, #111827 50%, #08111f 100%)",
  },
  "finance-to-finance": {
    main: "linear-gradient(160deg, #0d1f17 0%, #14532d 50%, #0d1f17 100%)",
    soft: "linear-gradient(160deg, #14532d 0%, #0d1f17 50%, rgba(22,163,74,0.15) 100%)",
  },
};

/* ───────────────────── Transition Overlay ──────────────────────────── */

interface TransitionOverlayProps {
  mode: TransitionMode;
  onComplete: () => void;
}

/**
 * Full-screen liquid sweep overlay.
 *
 * Two layers animate bottom → top with a brief hold in the middle.
 * Layer 1 is a sharp gradient (leading edge), layer 2 is a blurred
 * gradient that trails ~50 ms behind, creating a soft organic edge
 * that looks like a liquid veil.
 */
export function TransitionOverlay({ mode, onComplete }: TransitionOverlayProps) {
  const shouldReduce = useReducedMotion();
  const { main, soft } = PALETTES[mode];

  /* Reduced-motion fallback – simple opacity pulse */
  if (shouldReduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ background: main }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 0.4, times: [0, 0.3, 0.55, 1] }}
        onAnimationComplete={onComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
      {/* Layer 1 — sharp leading sweep */}
      <motion.div
        className="absolute inset-0"
        style={{ background: main, willChange: "transform" }}
        initial={{ y: "100%" }}
        animate={{ y: ["100%", "0%", "0%", "-100%"] }}
        transition={{
          duration: DURATION,
          times: [0, 0.38, 0.52, 1],
          ease: SWEEP_EASE,
        }}
      />

      {/* Layer 2 — blurred trailing sweep (liquid edge) */}
      <motion.div
        className="absolute -inset-10 blur-2xl"
        style={{ background: soft, willChange: "transform" }}
        initial={{ y: "110%" }}
        animate={{ y: ["110%", "0%", "0%", "-110%"] }}
        transition={{
          duration: DURATION,
          times: [0, 0.42, 0.52, 1],
          ease: SWEEP_EASE,
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
 * Wraps page content with a fade-up entrance timed to reveal after
 * the overlay sweep reaches its midpoint.
 */
export function AnimatedPage({ children }: AnimatedPageProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduce ? 0.2 : 0.4,
        delay: shouldReduce ? 0.15 : 0.28,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────── Finance Atmosphere Background ───────────────────── */

/**
 * Persistent emerald atmosphere behind finance pages.
 * Fades in/out via CSS transition — no framer-motion overhead.
 */
export function FinanceAtmosphere({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={`fixed inset-0 -z-10 pointer-events-none transition-opacity duration-700 ease-in-out ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Deep emerald gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-black to-emerald-950/40" />

      {/* Soft orb — top left */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[160px] animate-pulse-slow" />

      {/* Soft orb — bottom right */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-700/10 blur-[140px] animate-pulse-slow-delayed" />

      {/* Flowing highlight band */}
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
