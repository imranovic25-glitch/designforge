/* ═══════════════════════════════════════════════════════════════════════
 * LogoIntro — Full-screen logo that zooms out to navbar position.
 *
 * Sequence:
 *  1. Logo pops into existence at center (scale 0.75 → 1, opacity 0 → 1)
 *  2. Holds for ~700 ms
 *  3. Shrinks + flies to exact navbar logo position (measured at runtime)
 *  4. Overlay fades to transparent, then component unmounts
 *
 * Only runs once per browser session (sessionStorage flag).
 * ═══════════════════════════════════════════════════════════════════════ */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, useAnimation } from "motion/react";

const SIZE = 160; // px — intro logo diameter

export function LogoIntro({ onDone }: { onDone: () => void }) {
  const logoCtrl = useAnimation();
  const overlayCtrl = useAnimation();

  useEffect(() => {
    // Prevent scroll and hide navbar during the animation
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.setAttribute("data-intro", "1");

    async function run() {
      // ── 1. Pop in ──────────────────────────────────────────────────
      await logoCtrl.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      });

      // ── 2. Hold ────────────────────────────────────────────────────────────
      await new Promise<void>((r) => setTimeout(r, 400));

      // ── 3. Measure the real navbar logo and fly to it ──────────────
      const el = document.querySelector("[data-logo-mark]") as HTMLElement | null;
      let tx = 0, ty = 0, ts = 32 / SIZE;

      if (el) {
        const rect = el.getBoundingClientRect();
        // Offset of the navbar logo's center relative to the screen center
        tx = rect.left + rect.width / 2 - window.innerWidth / 2;
        ty = rect.top + rect.height / 2 - window.innerHeight / 2;
        // Target scale: navbar logo is 32 px (w-8), intro logo is SIZE
        ts = rect.width / SIZE;
      }

      await logoCtrl.start({
        x: tx,
        y: ty,
        scale: ts,
        transition: {
          duration: 0.7,
          ease: [0.76, 0, 0.24, 1],
        },
      });

      // ── 4. Fade overlay ────────────────────────────────────────────────────
      await overlayCtrl.start({
        opacity: 0,
        transition: { duration: 0.2, ease: "easeOut" },
      });

      document.body.style.overflow = prev;
      document.body.removeAttribute("data-intro");
      onDone();
    }

    run();

    return () => {
      document.body.style.overflow = prev;
      document.body.removeAttribute("data-intro");
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <motion.div
      animate={overlayCtrl}
      initial={{ opacity: 1 }}
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
          backgroundColor: "transparent",
          border: `${SIZE * 0.065}px solid white`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: SIZE * 0.1,
            height: SIZE * 0.1,
            borderRadius: "50%",
            backgroundColor: "white",
          }}
        />
      </motion.div>
    </motion.div>,
    document.body,
  );
}
