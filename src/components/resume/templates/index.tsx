/* ═══════════════════════════════════════════════════════════════════════
 * Template Registry — Maps TemplateId → Component + metadata.
 * ═══════════════════════════════════════════════════════════════════════ */

import type { ComponentType } from "react";
import type { ResumeData, TemplateId } from "@/src/lib/resume-types";
import { ExecutiveMinimal } from "./ExecutiveMinimal";
import { AtsProfessional } from "./AtsProfessional";
import { ModernSidebar } from "./ModernSidebar";
import { CreativeClean } from "./CreativeClean";
import { CompactPremium } from "./CompactPremium";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  component: ComponentType<{ data: ResumeData }>;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "executive-minimal",
    name: "Executive Minimal",
    description: "Refined single-column layout with elegant spacing",
    component: ExecutiveMinimal,
  },
  {
    id: "ats-professional",
    name: "ATS Professional",
    description: "Maximum ATS compatibility, clean & standard",
    component: AtsProfessional,
  },
  {
    id: "modern-sidebar",
    name: "Modern Sidebar",
    description: "Two-column with accent-colored sidebar",
    component: ModernSidebar,
  },
  {
    id: "creative-clean",
    name: "Creative Clean",
    description: "Timeline experience, tag skills, modern accents",
    component: CreativeClean,
  },
  {
    id: "compact-premium",
    name: "Compact Premium",
    description: "Space-efficient layout to fit more content",
    component: CompactPremium,
  },
];

export const TEMPLATE_MAP = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t])
) as Record<TemplateId, TemplateMeta>;

export function getTemplateComponent(id: TemplateId) {
  return TEMPLATE_MAP[id]?.component ?? ExecutiveMinimal;
}
