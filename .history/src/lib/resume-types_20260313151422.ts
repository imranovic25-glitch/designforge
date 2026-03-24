/* ═══════════════════════════════════════════════════════════════════════
 * Resume Data Schema
 * Complete, scalable type system for the premium resume builder.
 * ═══════════════════════════════════════════════════════════════════════ */

/* ── Helpers ─────────────────────────────────────────────────────────── */

export const uid = () => crypto.randomUUID();

/* ── Atomic types ────────────────────────────────────────────────────── */

export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: "native" | "fluent" | "advanced" | "intermediate" | "beginner";
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomItem[];
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

/* ── Style ───────────────────────────────────────────────────────────── */

export interface ResumeStyle {
  accentColor: string;
  fontFamily: "inter" | "georgia" | "merriweather" | "roboto" | "playfair";
  fontSize: number;   // 0.85 – 1.15 scale
  lineSpacing: number; // 1.0 – 1.8
  sectionSpacing: number; // 0.5 – 2.0 scale
}

/* ── Template ────────────────────────────────────────────────────────── */

export type TemplateId =
  | "executive-minimal"
  | "ats-professional"
  | "modern-sidebar"
  | "creative-clean"
  | "compact-premium";

/* ── Section identity ────────────────────────────────────────────────── */

export type SectionKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "custom";

export const SECTION_META: Record<SectionKey, { label: string; icon: string }> = {
  personal:       { label: "Personal Details",  icon: "User" },
  summary:        { label: "Summary",           icon: "FileText" },
  experience:     { label: "Work Experience",   icon: "Briefcase" },
  education:      { label: "Education",         icon: "GraduationCap" },
  skills:         { label: "Skills",            icon: "Wrench" },
  projects:       { label: "Projects",          icon: "FolderOpen" },
  certifications: { label: "Certifications",    icon: "Award" },
  languages:      { label: "Languages",         icon: "Globe" },
  custom:         { label: "Custom Sections",   icon: "LayoutList" },
};

/* ── Root model ──────────────────────────────────────────────────────── */

export interface ResumeData {
  personal: PersonalDetails;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  customSections: CustomSection[];
  sectionOrder: SectionKey[];
  sectionVisibility: Record<SectionKey, boolean>;
  style: ResumeStyle;
  templateId: TemplateId;
}

/* ── Factories ───────────────────────────────────────────────────────── */

export const emptyExperience = (): WorkExperience => ({
  id: uid(), company: "", position: "", startDate: "", endDate: "",
  current: false, description: "", highlights: [],
});

export const emptyEducation = (): Education => ({
  id: uid(), institution: "", degree: "", field: "",
  startDate: "", endDate: "", gpa: "", description: "",
});

export const emptySkill = (): Skill => ({ id: uid(), name: "", level: 3 });

export const emptyProject = (): Project => ({
  id: uid(), name: "", url: "", description: "", technologies: [],
});

export const emptyCertification = (): Certification => ({
  id: uid(), name: "", issuer: "", date: "", url: "",
});

export const emptyLanguage = (): Language => ({
  id: uid(), name: "", proficiency: "intermediate",
});

export const emptyCustomSection = (): CustomSection => ({
  id: uid(), title: "Custom Section", items: [],
});

export const emptyCustomItem = (): CustomItem => ({
  id: uid(), title: "", subtitle: "", date: "", description: "",
});

/* ── Defaults ────────────────────────────────────────────────────────── */

export const DEFAULT_SECTION_ORDER: SectionKey[] = [
  "personal", "summary", "experience", "education",
  "skills", "projects", "certifications", "languages", "custom",
];

export const DEFAULT_VISIBILITY: Record<SectionKey, boolean> = {
  personal: true, summary: true, experience: true, education: true,
  skills: true, projects: true, certifications: true, languages: true,
  custom: true,
};

export const DEFAULT_STYLE: ResumeStyle = {
  accentColor: "#0d9488",
  fontFamily: "inter",
  fontSize: 1,
  lineSpacing: 1.4,
  sectionSpacing: 1,
};

export const INITIAL_RESUME: ResumeData = {
  personal: {
    fullName: "", jobTitle: "", email: "", phone: "",
    location: "", website: "", linkedin: "",
  },
  summary: "",
  experience: [emptyExperience()],
  education: [emptyEducation()],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  customSections: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  sectionVisibility: { ...DEFAULT_VISIBILITY },
  style: { ...DEFAULT_STYLE },
  templateId: "executive-minimal",
};

/* ── Font stacks ─────────────────────────────────────────────────────── */

export const FONT_STACKS: Record<ResumeStyle["fontFamily"], string> = {
  inter:       "'Inter', system-ui, sans-serif",
  georgia:     "Georgia, 'Times New Roman', serif",
  merriweather: "'Merriweather', Georgia, serif",
  roboto:      "'Roboto', 'Helvetica Neue', sans-serif",
  playfair:    "'Playfair Display', Georgia, serif",
};

/* ── Accent colors ───────────────────────────────────────────────────── */

export const ACCENT_PRESETS = [
  "#0d9488", "#2563eb", "#7c3aed", "#dc2626",
  "#ea580c", "#0891b2", "#4f46e5", "#059669",
  "#d946ef", "#475569", "#000000",
];
