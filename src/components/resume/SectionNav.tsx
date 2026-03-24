/* ═══════════════════════════════════════════════════════════════════════
 * SectionNav — Left panel with section list, reorder, and visibility
 * Uses framer-motion Reorder for drag-and-drop.
 * ═══════════════════════════════════════════════════════════════════════ */

import { Reorder } from "motion/react";
import {
  User, FileText, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Globe, LayoutList, Eye, EyeOff, GripVertical,
} from "lucide-react";
import { useResume, useResumeActions } from "@/src/lib/resume-store";
import { type SectionKey, SECTION_META } from "@/src/lib/resume-types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  User, FileText, Briefcase, GraduationCap, Wrench,
  FolderOpen, Award, Globe, LayoutList,
};

export function SectionNav() {
  const { resume, activeSection, setActiveSection } = useResume();
  const { setSectionOrder, toggleSection } = useResumeActions();

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.15em] px-4 mb-3">
        Sections
      </h3>

      <Reorder.Group
        axis="y"
        values={resume.sectionOrder}
        onReorder={setSectionOrder}
        className="flex-1 space-y-1 overflow-y-auto"
      >
        {resume.sectionOrder.map((key) => {
          const meta = SECTION_META[key];
          const Icon = ICONS[meta.icon] ?? LayoutList;
          const visible = resume.sectionVisibility[key];
          const active = activeSection === key;

          return (
            <Reorder.Item
              key={key}
              value={key}
              className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/70"
              } ${!visible ? "opacity-40" : ""}`}
              onClick={() => setActiveSection(key)}
            >
              <GripVertical className="h-3.5 w-3.5 text-white/20 opacity-0 group-hover:opacity-100 shrink-0 cursor-grab active:cursor-grabbing transition-opacity" />
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">{meta.label}</span>
              <button
                className="p-1 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection(key);
                }}
                title={visible ? "Hide section" : "Show section"}
              >
                {visible ? (
                  <Eye className="h-3.5 w-3.5 text-white/40" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-white/30" />
                )}
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
