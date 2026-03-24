/**
 * DesignForge360 — Premium Page Transitions
 * ═══════════════════════════════════════════
 *
 * Two transition variants based on route type:
 *   Grid Tiles (default) — 28 tiles cascade in a diagonal wave
 *   Liquid Blob (finance) — organic shape contracts to center
 *
 * Architecture: Layout mounts overlay on route change; overlay
 * starts covering the viewport and animates away to reveal content.
 *
 * Accessibility: prefers-reduced-motion → instant opacity fade.
 */

import { motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useCallback } from "react";

/* ═══════════════════ Grid Tile Config ═══════════════════════════════ */

const COLS = 7;
const ROWS = 4;
const MAX_DIAG = COLS - 1 + ROWS - 1;
const TILE_STAGGER = 0.025;
const TILE_DURATION = 0.45;
const TILE_EASE: [number, number, number, number] = [0.4, 0, 0.15, 1];

/* ═══════════════════ Liquid Blob Config ═════════════════════════════ */

const BLOB_DURATION = 0.72;
const BLOB_EASE: [number, number, number, number] = [0.32, 0, 0.15, 1];

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
        const intensity = Math.sin(t * Math.PI);
        const r = Math.round(12 + intensity * 22);
        const g = Math.round(8 + intensity * 10);
        const b = Math.round(18 + intensity * 42);
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
          backdropFilter: "blur(10px) saturate(1.2)",
          WebkitBackdropFilter: "blur(10px) saturate(1.2)",
          backgroundColor: "rgba(5, 3, 12, 0.35)",
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
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

      {/* Diagonal shimmer sweep */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, transparent 0%, transparent 46%, rgba(140,100,230,0.07) 49%, rgba(180,140,255,0.13) 50%, rgba(140,100,230,0.07) 51%, transparent 54%, transparent 100%)",
          willChange: "transform",
        }}
        initial={{ x: "-100%", y: "-100%" }}
        animate={{ x: "100%", y: "100%" }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1], delay: 0.04 }}
      />
    </div>
  );
}

/* ═══════════════════ Liquid Blob Transition ═════════════════════════ */

function LiquidBlobTransition({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Background tint */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(5, 3, 10, 0.6)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{
          duration: BLOB_DURATION * 0.8,
          delay: 0.1,
          ease: "easeOut",
        }}
      />

      {/* Secondary echo blob */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "280vmax",
          height: "280vmax",
          x: "-50%",
          y: "-50%",
          borderRadius: "55% 45% 52% 48% / 48% 55% 45% 52%",
          background:
            "radial-gradient(ellipse at center, rgba(18,12,35,0.6) 0%, rgba(8,5,18,0.3) 60%, transparent 100%)",
          willChange: "transform",
        }}
        initial={{ scale: 1, rotate: 0 }}
        animate={{ scale: 0, rotate: -25 }}
        transition={{
          scale: { duration: BLOB_DURATION * 1.08, ease: BLOB_EASE },
          rotate: { duration: BLOB_DURATION * 1.08, ease: "easeInOut" },
        }}
      />

      {/* Primary blob */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "260vmax",
          height: "260vmax",
          x: "-50%",
          y: "-50%",
          background:
            "radial-gradient(ellipse at center, #0f0826 0%, #0a0518 40%, #050308 100%)",
          willChange: "transform",
        }}
        initial={{
          scale: 1,
          rotate: 0,
          borderRadius: "42% 58% 45% 55% / 55% 42% 58% 45%",
        }}
        animate={{
          scale: 0,
          rotate: 35,
          borderRadius: "50% 50% 50% 50% / 50% 50% 50% 50%",
        }}
        transition={{
          scale: { duration: BLOB_DURATION, ease: BLOB_EASE },
          rotate: { duration: BLOB_DURATION, ease: "easeInOut" },
          borderRadius: {
            duration: BLOB_DURATION * 0.8,
            ease: "easeInOut",
          },
        }}
        onAnimationComplete={onComplete}
      />

      {/* Converging glow point */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "80px",
          height: "80px",
          x: "-50%",
          y: "-50%",
          borderRadius: "50%",
          boxShadow:
            "0 0 60px 30px rgba(120,80,200,0.12), 0 0 120px 60px rgba(80,50,180,0.06)",
          willChange: "transform, opacity",
        }}
        initial={{ scale: 12, opacity: 0 }}
        animate={{ scale: 0, opacity: [0, 0.5, 0.8, 0] }}
        transition={{
          scale: { duration: BLOB_DURATION, ease: BLOB_EASE },
          opacity: {
            duration: BLOB_DURATION,
            times: [0, 0.25, 0.6, 1],
          },
        }}
      />
    </div>
  );
}

/* ═══════════════════ TransitionOverlay ═══════════════════════════════ */

interface TransitionOverlayProps {
  onComplete: () => void;
  variant?: "grid" | "blob";
}

export function TransitionOverlay({
  onComplete,
  variant = "grid",
}: TransitionOverlayProps) {
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

  return variant === "blob" ? (
    <LiquidBlobTransition onComplete={onComplete} />
  ) : (
    <GridTileTransition onComplete={onComplete} />
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
