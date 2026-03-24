/**
 * DesignForge360 — Dynamic SVG Path-Morphing Page Transition
 * ══════════════════════════════════════════════════════════════
 *
 * Technique: True SVG `d` attribute morphing via Framer Motion.
 * Instead of animating HTML divs with CSS clip-path, we animate
 * the `d` attribute of actual `<path>` elements inside a full-screen
 * `<svg>`. Framer Motion mathematically interpolates the Bézier
 * control points between initial → animate → exit path strings,
 * producing a genuine liquid organic morph.
 *
 * Architecture
 * ────────────
 * 1. Click tracking — a global listener captures the last click X
 *    position (normalised to the 0–1000 SVG viewBox). The wave peak
 *    forms at the click origin.
 *
 * 2. Five stacked SVG path layers with grayscale fills, each
 *    staggered by 0.02 s for a cascading liquid-ribbon effect
 *    with 3D depth.
 *
 * 3. Split easing —
 *      exit  (covering the screen): easeInCubic  [0.64, 0, 0.78, 0]
 *      enter (uncovering the screen): easeOutCubic [0.22, 1, 0.36, 1]
 *    This gives momentum: the wave accelerates in, then decelerates
 *    out without ever pausing awkwardly in the middle.
 *
 * 4. Route-aware colouring — layer fills shift between dark-navy
 *    and emerald tones depending on TransitionMode.
 *
 * Integration
 * ───────────
 * Requires `<AnimatePresence mode="wait">` wrapping the `<Outlet>`
 * in Layout.tsx so that Framer Motion keeps the exiting page in the
 * DOM long enough for the exit animation to play.
 *
 *   <AnimatePresence mode="wait">
 *     <PageTransition key={location.pathname}>
 *       <Outlet />
 *     </PageTransition>
 *   </AnimatePresence>
 *
 * Accessibility
 * ─────────────
 * prefers-reduced-motion → instant opacity swap, no SVG animation.
 */

import { type ReactNode, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TransitionMode } from "@/src/lib/route-utils";

/* ══════════════════ Click Tracking ═══════════════════════════════════ */

/** Normalised last-click X in SVG space (0–1000). Default: centre. */
let lastClickX = 500;

if (typeof window !== "undefined") {
  window.addEventListener("click", (e) => {
    lastClickX = (e.clientX / window.innerWidth) * 1000;
  });
}

/* ══════════════════ Constants ════════════════════════════════════════ */

const NUM_LAYERS = 5;
const DELAY_STEP = 0.02;            // stagger between layers
const EXIT_DURATION = 0.55;         // cover the screen
const ENTER_DURATION = 0.55;        // uncover the screen
const EASE_IN: [number, number, number, number] = [0.64, 0, 0.78, 0];
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ══════════════════ SVG Path Generators ══════════════════════════════ */

/**
 * Builds a full-coverage SVG path string whose leading edge (the
 * right side) is a cubic Bézier S-curve whose peak is centred on
 * `peakX`. The rest of the shape fills the entire 1000×1000 viewBox.
 *
 * Path anatomy:
 *   M 0,0 → bottom-left start
 *   L peakX±offset,0 → horizontal run along the top
 *   C ... → S-curve down the right side (the "liquid edge")
 *   L 0,1000 → back to bottom-left
 *   Z → close
 */
function buildCoveringPath(peakX: number): string {
  // Clamp peak so the curve never extends outside the viewBox
  const px = Math.max(150, Math.min(850, peakX));
  return [
    `M 0 0`,
    `L ${px - 150} 0`,
    // Top bulge of the S-curve
    `C ${px + 100} 0, ${px + 250} 250, ${px} 500`,
    // Bottom bulge
    `C ${px - 250} 750, ${px + 100} 1000, ${px - 150} 1000`,
    `L 0 1000`,
    `Z`,
  ].join(" ");
}

/** Rectangle that fills nothing (off-screen right) */
const PATH_HIDDEN_RIGHT =
  "M 1000 0 L 1200 0 C 1200 0, 1200 500, 1200 500 C 1200 500, 1200 1000, 1200 1000 L 1000 1000 Z";

/** Rectangle that fills everything */
const PATH_FULL =
  "M 0 0 L 1000 0 C 1000 0, 1000 500, 1000 500 C 1000 500, 1000 1000, 1000 1000 L 0 1000 Z";

/** Off-screen left (for exit) */
const PATH_HIDDEN_LEFT =
  "M -200 0 L 0 0 C 0 0, 0 500, 0 500 C 0 500, 0 1000, 0 1000 L -200 1000 Z";

/* ══════════════════ Route-Aware Layer Fills ══════════════════════════ */

/**
 * Five grayscale-ish steps per mode. Layer 0 = darkest (front),
 * layer 4 = lightest (back). For finance modes the "greys" shift
 * towards dark emeralds.
 */
const LAYER_FILLS: Record<TransitionMode, string[]> = {
  "normal-to-normal": [
    "#08111f", "#0d1526", "#111827", "#1a2232", "#222c3c",
  ],
  "normal-to-finance": [
    "#08111f", "#0b1a1a", "#0d1f17", "#14392a", "#14532d",
  ],
  "finance-to-normal": [
    "#14532d", "#14392a", "#0d1f17", "#0b1a1a", "#08111f",
  ],
  "finance-to-finance": [
    "#0d1f17", "#0f2a1e", "#14532d", "#166534", "#0d1f17",
  ],
};

/* ══════════════════ Variant Factory ══════════════════════════════════ */

function createVariants(layerIndex: number) {
  const delay = layerIndex * DELAY_STEP;

  return {
    initial: {
      d: PATH_HIDDEN_RIGHT,
    },
    animate: {
      d: PATH_FULL,
      transition: {
        duration: EXIT_DURATION,
        delay,
        ease: EASE_IN,
      },
    },
    exit: {
      d: PATH_HIDDEN_LEFT,
      transition: {
        duration: ENTER_DURATION,
        delay,
        ease: EASE_OUT,
      },
    },
  };
}

/* ══════════════════ Single SVG Layer ═════════════════════════════════ */

function WaveLayer({
  layerIndex,
  fill,
}: {
  layerIndex: number;
  fill: string;
}) {
  const variants = createVariants(layerIndex);

  return (
    <svg
      className="fixed inset-0 z-[100] w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        fill={fill}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
      />
    </svg>
  );
}

/* ══════════════════ PageTransition (main export) ═════════════════════ */

interface PageTransitionProps {
  children: ReactNode;
  mode?: TransitionMode;
}

/**
 * Wrap each page's content in this component. It must live inside an
 * `<AnimatePresence mode="wait">` keyed by `location.pathname` so
 * Framer Motion can play the exit animation before unmounting.
 *
 * Usage:
 *   <AnimatePresence mode="wait">
 *     <PageTransition key={location.pathname} mode={mode}>
 *       <Outlet />
 *     </PageTransition>
 *   </AnimatePresence>
 */
export function PageTransition({ children, mode = "normal-to-normal" }: PageTransitionProps) {
  const shouldReduce = useReducedMotion();
  const fills = LAYER_FILLS[mode];

  /*
   * Inject click position into the animate path right before the
   * animation starts so the wave peaks where the user clicked.
   * We override the "animate" variant's `d` with the dynamic path.
   */
  const dynamicPath = buildCoveringPath(lastClickX);

  // Scroll to top when the new page enters
  const hasScrolled = useRef(false);
  useEffect(() => {
    if (!hasScrolled.current) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      hasScrolled.current = true;
    }
  }, []);

  /* Reduced-motion fallback — simple fade swap */
  if (shouldReduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.001 }}
    >
      {/* ── 5 stacked SVG wave layers ──────────────────────── */}
      {fills.map((fill, i) => (
        <DynamicWaveLayer
          key={i}
          layerIndex={i}
          fill={fill}
          dynamicPath={dynamicPath}
        />
      ))}

      {/* ── Page content ───────────────────────────────────── */}
      {children}
    </motion.div>
  );
}

/* ══════════════════ Dynamic Wave Layer ═══════════════════════════════ */

/**
 * Each layer morphs: hidden-right → dynamic-wave-shape → full → hidden-left.
 * The dynamic wave shape places the Bézier peak at the click position.
 */
function DynamicWaveLayer({
  layerIndex,
  fill,
  dynamicPath,
}: {
  layerIndex: number;
  fill: string;
  dynamicPath: string;
}) {
  const delay = layerIndex * DELAY_STEP;

  return (
    <svg
      className="fixed inset-0 z-[100] w-full h-full pointer-events-none"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        fill={fill}
        initial={{ d: PATH_HIDDEN_RIGHT }}
        animate={{ d: dynamicPath }}
        exit={{ d: PATH_HIDDEN_LEFT }}
        transition={{
          d: {
            duration: EXIT_DURATION,
            delay,
            ease: EASE_IN,
          },
        }}
      />
    </svg>
  );
}

/* ══════════════════ Finance Atmosphere ═══════════════════════════════ */

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
