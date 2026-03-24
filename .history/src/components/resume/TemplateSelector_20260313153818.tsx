/* ═══════════════════════════════════════════════════════════════════════
 * TemplateSelector — Visual grid of template thumbnails.
 * ═══════════════════════════════════════════════════════════════════════ */

import { useResume, useResumeActions } from "@/src/lib/resume-store";
import { TEMPLATES } from "./templates";
import { Check } from "lucide-react";
import type { TemplateId } from "@/src/lib/resume-types";

/* Mini decorative thumbnails — purely visual hints */
const THUMB_LAYOUTS: Record<TemplateId, React.ReactNode> = {
  "executive-minimal": (
    <div className="flex flex-col items-center gap-1.5 py-2">
      <div className="w-10 h-1 rounded-full bg-current opacity-60" />
      <div className="w-6 h-0.5 rounded-full bg-current opacity-30" />
      <div className="w-full h-px bg-current opacity-15 mt-1" />
      <div className="w-full space-y-1 mt-1">
        <div className="w-8 h-0.5 rounded bg-current opacity-40" />
        <div className="w-full h-0.5 rounded bg-current opacity-15" />
        <div className="w-3/4 h-0.5 rounded bg-current opacity-15" />
      </div>
    </div>
  ),
  "ats-professional": (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="w-10 h-1 rounded bg-current opacity-60" />
      <div className="w-6 h-0.5 rounded bg-current opacity-30" />
      <div className="w-full h-px bg-current opacity-15 mt-1" />
      <div className="w-full space-y-1">
        <div className="w-7 h-0.5 rounded bg-current opacity-40" />
        <div className="w-full h-0.5 rounded bg-current opacity-15" />
        <div className="w-5/6 h-0.5 rounded bg-current opacity-15" />
      </div>
      <div className="w-full h-px bg-current opacity-10" />
      <div className="w-full space-y-1">
        <div className="w-7 h-0.5 rounded bg-current opacity-40" />
        <div className="w-full h-0.5 rounded bg-current opacity-15" />
      </div>
    </div>
  ),
  "modern-sidebar": (
    <div className="flex gap-1 py-2 h-full">
      <div className="w-1/3 bg-current opacity-20 rounded-sm" />
      <div className="flex-1 space-y-1.5 py-0.5">
        <div className="w-8 h-1 rounded bg-current opacity-50" />
        <div className="w-full h-0.5 rounded bg-current opacity-15" />
        <div className="w-3/4 h-0.5 rounded bg-current opacity-15" />
        <div className="w-6 h-0.5 rounded bg-current opacity-35 mt-1" />
        <div className="w-full h-0.5 rounded bg-current opacity-15" />
      </div>
    </div>
  ),
  "creative-clean": (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center gap-1">
        <div className="w-0.5 h-4 bg-current opacity-40 rounded" />
        <div>
          <div className="w-9 h-1 rounded bg-current opacity-60" />
          <div className="w-5 h-0.5 rounded bg-current opacity-25 mt-0.5" />
        </div>
      </div>
      <div className="flex items-start gap-1 mt-1">
        <div className="w-1 h-1 rounded-full bg-current opacity-40 mt-0.5 shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="w-6 h-0.5 rounded bg-current opacity-40" />
          <div className="w-full h-0.5 rounded bg-current opacity-15" />
        </div>
      </div>
    </div>
  ),
  "compact-premium": (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex justify-between items-end">
        <div className="w-8 h-1 rounded bg-current opacity-60" />
        <div className="w-5 h-0.5 rounded bg-current opacity-20" />
      </div>
      <div className="w-full h-0.5 rounded-full bg-current opacity-30" />
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-0.5">
        <div className="w-5 h-0.5 rounded bg-current opacity-35" />
        <div className="w-4 h-0.5 rounded bg-current opacity-35" />
        <div className="w-full h-0.5 rounded bg-current opacity-12" />
        <div className="w-full h-0.5 rounded bg-current opacity-12" />
      </div>
    </div>
  ),
};

export function TemplateSelector() {
  const { resume } = useResume();
  const { setTemplate } = useResumeActions();

  return (
    <div>
      <p className="text-[11px] font-medium text-white/40 mb-2">Template</p>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => {
          const active = resume.templateId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`relative rounded-lg border p-2.5 text-left transition-all ${
                active
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-300"
                  : "border-white/8 bg-white/[0.03] text-white/50 hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              {active && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-teal-400 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-[#0f172a]" />
                </div>
              )}
              <div className="h-14 overflow-hidden px-1">
                {THUMB_LAYOUTS[t.id]}
              </div>
              <p className="text-[10px] font-semibold mt-1 truncate">{t.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
