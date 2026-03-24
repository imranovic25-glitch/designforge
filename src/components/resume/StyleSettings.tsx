/* ═══════════════════════════════════════════════════════════════════════
 * StyleSettings — Accent color picker, font family, font size,
 * line spacing, section spacing controls.
 * ═══════════════════════════════════════════════════════════════════════ */

import { useResume, useResumeActions } from "@/src/lib/resume-store";
import { ACCENT_PRESETS, type ResumeStyle } from "@/src/lib/resume-types";
import { Check } from "lucide-react";

const FONT_OPTIONS: { value: ResumeStyle["fontFamily"]; label: string }[] = [
  { value: "inter", label: "Inter" },
  { value: "georgia", label: "Georgia" },
  { value: "merriweather", label: "Merriweather" },
  { value: "roboto", label: "Roboto" },
  { value: "playfair", label: "Playfair Display" },
];

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-white/40 font-medium">{label}</span>
        <span className="text-white/60 tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-teal-400 bg-white/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5
                   [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-teal-400 [&::-webkit-slider-thumb]:shadow-md"
      />
    </div>
  );
}

export function StyleSettings() {
  const { resume } = useResume();
  const { setStyle } = useResumeActions();
  const s = resume.style;

  return (
    <div className="space-y-5">
      {/* Accent color */}
      <div>
        <p className="text-[11px] font-medium text-white/40 mb-2">Accent Color</p>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => setStyle({ accentColor: color })}
              className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
              style={{
                background: color,
                borderColor: s.accentColor === color ? "white" : "transparent",
              }}
            >
              {s.accentColor === color && (
                <Check className="h-3.5 w-3.5 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Font family */}
      <div>
        <p className="text-[11px] font-medium text-white/40 mb-2">Font Family</p>
        <select
          value={s.fontFamily}
          onChange={(e) => setStyle({ fontFamily: e.target.value as ResumeStyle["fontFamily"] })}
          className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2
                     text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-teal-500/40"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value} className="bg-[#1e293b]">
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sliders */}
      <Slider label="Font Size" value={s.fontSize} min={0.85} max={1.15} step={0.01} onChange={(v) => setStyle({ fontSize: v })} />
      <Slider label="Line Spacing" value={s.lineSpacing} min={1.0} max={1.8} step={0.05} onChange={(v) => setStyle({ lineSpacing: v })} />
      <Slider label="Section Spacing" value={s.sectionSpacing} min={0.5} max={2.0} step={0.05} onChange={(v) => setStyle({ sectionSpacing: v })} />
    </div>
  );
}
