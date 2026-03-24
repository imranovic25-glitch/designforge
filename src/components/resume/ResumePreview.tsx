/* ═══════════════════════════════════════════════════════════════════════
 * ResumePreview — Right panel showing the selected template at A4 ratio
 * with paper shadow and automatic scaling.
 * ═══════════════════════════════════════════════════════════════════════ */

import { useRef, useState, useEffect } from "react";
import { useResume } from "@/src/lib/resume-store";
import { getTemplateComponent } from "./templates";

export function ResumePreview() {
  const { resume } = useResume();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const Template = getTemplateComponent(resume.templateId);

  // A4 dimensions in px at 96dpi
  const A4_W = 794;
  const A4_H = 1123;

  useEffect(() => {
    function recalc() {
      const el = containerRef.current;
      if (!el) return;
      const containerW = el.clientWidth - 32; // padding
      const containerH = el.clientHeight - 32;
      const sx = containerW / A4_W;
      const sy = containerH / A4_H;
      setScale(Math.min(sx, sy, 1));
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full flex items-start justify-center overflow-auto py-4 px-4"
    >
      <div
        style={{
          width: A4_W,
          minHeight: A4_H,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
          boxShadow: "0 4px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.04)",
          borderRadius: 4,
          overflow: "hidden",
          background: "white",
        }}
      >
        <Template data={resume} />
      </div>
    </div>
  );
}

/* ── Export-ready version (used by PDF export) ───────────────────────── */

export function ResumePreviewPrint({ onReady }: { onReady?: () => void }) {
  const { resume } = useResume();
  const Template = getTemplateComponent(resume.templateId);

  useEffect(() => {
    // give browser a frame to paint
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);

  return (
    <div id="resume-print" style={{ width: 794, minHeight: 1123, background: "white" }}>
      <Template data={resume} />
    </div>
  );
}
