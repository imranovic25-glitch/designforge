/**
 * DesignForge360 — Premium Diagonal Grid Page Transition
 * ═══════════════════════════════════════════════════════════
 *
 * 40 tiles (8×5) cascade in a diagonal wave with deep violet-to-black
 * gradients, frosted backdrop blur, and a bright diagonal shimmer sweep.
 *
 * Architecture: Layout mounts overlay on route change; tiles cover
 * the viewport and shrink away diagonally to reveal new content.
 * Page content renders at full opacity BEHIND the overlay — no double
 * fade, no blink.
 *
 * Accessibility: prefers-reduced-motion → instant opacity fade.
 */

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useCallback } from "react";

/* ═══════════════════ Grid Tile Config ═══════════════════════════════ */

const COLS = 8;
const ROWS = 5;
const MAX_DIAG = COLS - 1 + ROWS - 1;
const TILE_STAGGER = 0.022;
const TILE_DURATION = 0.42;
const TILE_EASE: [number, number, number, number] = [0.4, 0, 0.12, 1];

/* ═══════════════════ Grid Tile Transition ═══════════════════════════ */

interface TileData {
  row: number;
  col: number;
  diag: number;
  delay: number;
  bg: string;
  origin: string;
}

function GridTileTransition({ onComplete }: { onComplete: () => void }) {
  const calledRef = useRef(false);
  const handleComplete = useCallback(() => {
    if (!calledRef.current) {
      calledRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  const tiles = useMemo<TileData[]>(() => {
    const arr: TileData[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const diag = col + row;
        const t = diag / MAX_DIAG;
        /* Richer violet-to-deep-black gradient across the diagonal */
        const intensity = Math.sin(t * Math.PI);
        const r = Math.round(8 + intensity * 30);
        const g = Math.round(4 + intensity * 8);
        const b = Math.round(14 + intensity * 56);
        arr.push({
          row,
          col,
          diag,
          delay: diag * TILE_STAGGER,
          bg: `rgb(${r}, ${g}, ${b})`,
          origin: diag % 2 === 0 ? "center top" : "center bottom",
        });
      }
    }
    return arr;
  }, []);

  const lastIndex = tiles.length - 1;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Frosted base — blurs content and fades as tiles clear */}
      <motion.div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          backgroundColor: "rgba(5, 2, 16, 0.55)",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
      />

      {/* Tile grid */}
      <div
        className="absolute inset-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {tiles.map((tile, i) => (
          <motion.div
            key={i}
            style={{
              backgroundColor: tile.bg,
              transformOrigin: tile.origin,
              willChange: "transform, opacity",
            }}
            initial={{ scaleY: 1, opacity: 1 }}
            animate={{ scaleY: 0, opacity: 0 }}
            transition={{
              scaleY: {
                duration: TILE_DURATION,
                delay: tile.delay,
                ease: TILE_EASE,
              },
              opacity: {
                duration: TILE_DURATION * 0.55,
                delay: tile.delay + TILE_DURATION * 0.45,
                ease: "easeOut",
              },
            }}
            onAnimationComplete={i === lastIndex ? handleComplete : undefined}
          />
        ))}
      </div>

      {/* Primary diagonal shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 0%, transparent 44%, rgba(120,80,220,0.06) 47%, rgba(180,140,255,0.18) 50%, rgba(120,80,220,0.06) 53%, transparent 56%, transparent 100%)",
          willChange: "transform",
        }}
        initial={{ x: "-100%", y: "-100%" }}
        animate={{ x: "100%", y: "100%" }}
        transition={{ duration: 0.58, ease: [0.35, 0, 0.15, 1], delay: 0.03 }}
      />

      {/* Secondary warm shimmer (slightly delayed) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 0%, transparent 46%, rgba(200,160,255,0.04) 49%, rgba(255,200,255,0.08) 50%, rgba(200,160,255,0.04) 51%, transparent 54%, transparent 100%)",
          willChange: "transform",
        }}
        initial={{ x: "-100%", y: "-100%" }}
        animate={{ x: "100%", y: "100%" }}
        transition={{ duration: 0.52, ease: [0.35, 0, 0.15, 1], delay: 0.08 }}
      />
    </div>
  );
}

/* ═══════════════════ TransitionOverlay ═══════════════════════════════ */

interface TransitionOverlayProps {
  onComplete: () => void;
}

export function TransitionOverlay({ onComplete }: TransitionOverlayProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-black pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onAnimationComplete={onComplete}
      />
    );
  }

  return <GridTileTransition onComplete={onComplete} />;
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
