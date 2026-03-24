/* ═══════════════════════════════════════════════════════════════════════
 * LogoIntro — Full-screen logo that zooms out to navbar position.
 *
 * Sequence:
 *  1. Logo pops into existence at center (scale 0.75 → 1, opacity 0 → 1)
 *  2. Holds for ~400 ms
 *  3. Shrinks + flies to exact navbar logo position (measured at runtime)
 *  4. Overlay fades to transparent, then component unmounts
 *
 * Client-only: renders null during SSR / prerender to avoid hydration
 * mismatch and prevent the black overlay from being baked into static HTML.
 *
 * Uses localStorage("df360_intro_seen") so the intro only plays once.
 * Hard safety timeout of 4 s guarantees the overlay always clears.
 * ═══════════════════════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, useAnimation } from "motion/react";

const SIZE = 160;
const SAFETY_TIMEOUT = 4000;

export function LogoIntro({ onDone }: { onDone: () => void }) {
  const [mounted, setMounted] = useState(false);
  const doneRef = useRef(false);
  const logoCtrl = useAnimation();
  const overlayCtrl = useAnimation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Already seen — skip immediately
    try {
      if (localStorage.getItem("df360_intro_seen")) {
        finish();
        return;
      }
    } catch { /* localStorage unavailable */ }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-intro", "1");

    const safetyTimer = setTimeout(() => finish(prev), SAFETY_TIMEOUT);

    async function run() {
      try {
        await logoCtrl.start({
          opacity: 1,
          scale: 1,
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        });

        await new Promise<void>((r) => setTimeout(r, 400));

        const el = document.querySelector("[data-logo-mark]") as HTMLElement | null;
        let tx = 0, ty = 0, ts = 32 / SIZE;
        if (el) {
          const rect = el.getBoundingClientRect();
          tx = rect.left + rect.width / 2 - window.innerWidth / 2;
          ty = rect.top + rect.height / 2 - window.innerHeight / 2;
          ts = rect.width / SIZE;
        }

        await logoCtrl.start({
          x: tx, y: ty, scale: ts,
          transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
        });

        await overlayCtrl.start({
          opacity: 0,
          transition: { duration: 0.2, ease: "easeOut" },
        });

        finish(prev);
      } catch {
        finish(prev);
      }
    }

    run();

    return () => {
      clearTimeout(safetyTimer);
      document.body.style.overflow = prev;
      document.body.removeAttribute("data-intro");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  function finish(prevOverflow?: string) {
    if (doneRef.current) return;
    doneRef.current = true;
    try { localStorage.setItem("df360_intro_seen", "1"); } catch { /* */ }
    if (prevOverflow !== undefined) document.body.style.overflow = prevOverflow;
    document.body.removeAttribute("data-intro");
    document.body.setAttribute("data-intro", "0");
    onDone();
  }

  // Client-only guard: render nothing during SSR / prerender
  if (!mounted) return null;

  return createPortal(
    <motion.div
      animate={overlayCtrl}
      initial={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "black", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {/* Soft glow behind the logo — stationary, fades with overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: SIZE * 3,
          height: SIZE * 3,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Outer ring pulse — decorative ring that expands during hold */}
      <motion.div
        aria-hidden="true"
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1.6, opacity: [0, 0.12, 0] }}
        transition={{ delay: 0.65, duration: 0.9, ease: "easeOut" }}
        style={{
          position: "absolute",
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          border: "1.5px solid rgba(255,255,255,0.4)",
          pointerEvents: "none",
        }}
      />

      {/* The logo mark */}
      <motion.div
        animate={logoCtrl}
        initial={{ opacity: 0, scale: 0.75 }}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: "50%",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          boxShadow: "0 0 0 0 rgba(255,255,255,0)",
        }}
      >
        <div
          style={{
            width: SIZE * 0.45,
            height: SIZE * 0.45,
            borderRadius: "50%",
            backgroundColor: "black",
          }}
        />
      </motion.div>
    </motion.div>,
    document.body,
  );
}
