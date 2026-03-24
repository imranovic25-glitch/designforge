/* ═══════════════════════════════════════════════════════════════════════
 * Resume Store — React Context + useReducer
 * Provides global resume state, dispatch helpers, and localStorage
 * persistence.
 * ═══════════════════════════════════════════════════════════════════════ */

import {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type ResumeData,
  type SectionKey,
  type TemplateId,
  type ResumeStyle,
  type WorkExperience,
  type Education,
  type Skill,
  type Project,
  type Certification,
  type Language,
  type CustomSection,
  type PersonalDetails,
  INITIAL_RESUME,
} from "./resume-types";

/* ── Actions ─────────────────────────────────────────────────────────── */

type Action =
  | { type: "SET_PERSONAL"; payload: Partial<PersonalDetails> }
  | { type: "SET_SUMMARY"; payload: string }
  | { type: "SET_EXPERIENCE"; payload: WorkExperience[] }
  | { type: "SET_EDUCATION"; payload: Education[] }
  | { type: "SET_SKILLS"; payload: Skill[] }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "SET_CERTIFICATIONS"; payload: Certification[] }
  | { type: "SET_LANGUAGES"; payload: Language[] }
  | { type: "SET_CUSTOM_SECTIONS"; payload: CustomSection[] }
  | { type: "SET_SECTION_ORDER"; payload: SectionKey[] }
  | { type: "TOGGLE_SECTION"; payload: SectionKey }
  | { type: "SET_TEMPLATE"; payload: TemplateId }
  | { type: "SET_STYLE"; payload: Partial<ResumeStyle> }
  | { type: "LOAD"; payload: ResumeData };

/* ── Reducer ─────────────────────────────────────────────────────────── */

function reducer(state: ResumeData, action: Action): ResumeData {
  switch (action.type) {
    case "SET_PERSONAL":
      return { ...state, personal: { ...state.personal, ...action.payload } };
    case "SET_SUMMARY":
      return { ...state, summary: action.payload };
    case "SET_EXPERIENCE":
      return { ...state, experience: action.payload };
    case "SET_EDUCATION":
      return { ...state, education: action.payload };
    case "SET_SKILLS":
      return { ...state, skills: action.payload };
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "SET_CERTIFICATIONS":
      return { ...state, certifications: action.payload };
    case "SET_LANGUAGES":
      return { ...state, languages: action.payload };
    case "SET_CUSTOM_SECTIONS":
      return { ...state, customSections: action.payload };
    case "SET_SECTION_ORDER":
      return { ...state, sectionOrder: action.payload };
    case "TOGGLE_SECTION":
      return {
        ...state,
        sectionVisibility: {
          ...state.sectionVisibility,
          [action.payload]: !state.sectionVisibility[action.payload],
        },
      };
    case "SET_TEMPLATE":
      return { ...state, templateId: action.payload };
    case "SET_STYLE":
      return { ...state, style: { ...state.style, ...action.payload } };
    case "LOAD":
      return action.payload;
    default:
      return state;
  }
}

/* ── Context ─────────────────────────────────────────────────────────── */

interface ResumeCtx {
  resume: ResumeData;
  dispatch: React.Dispatch<Action>;
  activeSection: SectionKey;
  setActiveSection: (s: SectionKey) => void;
}

const Ctx = createContext<ResumeCtx | null>(null);

/* ── Provider ────────────────────────────────────────────────────────── */

const STORAGE_KEY = "designforge-resume";

function loadSaved(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ResumeData;
  } catch { /* ignore corrupt data */ }
  return INITIAL_RESUME;
}

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, dispatch] = useReducer(reducer, undefined, loadSaved);
  const [activeSection, setActiveSection] = useState<SectionKey>("personal");

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  return (
    <Ctx.Provider value={{ resume, dispatch, activeSection, setActiveSection }}>
      {children}
    </Ctx.Provider>
  );
}

export function useResume() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useResume must be used inside ResumeProvider");
  return ctx;
}

/* ── Convenience hooks ───────────────────────────────────────────────── */

export function useResumeActions() {
  const { dispatch } = useResume();

  return {
    setPersonal: useCallback(
      (p: Partial<PersonalDetails>) => dispatch({ type: "SET_PERSONAL", payload: p }),
      [dispatch],
    ),
    setSummary: useCallback(
      (s: string) => dispatch({ type: "SET_SUMMARY", payload: s }),
      [dispatch],
    ),
    setExperience: useCallback(
      (e: WorkExperience[]) => dispatch({ type: "SET_EXPERIENCE", payload: e }),
      [dispatch],
    ),
    setEducation: useCallback(
      (e: Education[]) => dispatch({ type: "SET_EDUCATION", payload: e }),
      [dispatch],
    ),
    setSkills: useCallback(
      (s: Skill[]) => dispatch({ type: "SET_SKILLS", payload: s }),
      [dispatch],
    ),
    setProjects: useCallback(
      (p: Project[]) => dispatch({ type: "SET_PROJECTS", payload: p }),
      [dispatch],
    ),
    setCertifications: useCallback(
      (c: Certification[]) => dispatch({ type: "SET_CERTIFICATIONS", payload: c }),
      [dispatch],
    ),
    setLanguages: useCallback(
      (l: Language[]) => dispatch({ type: "SET_LANGUAGES", payload: l }),
      [dispatch],
    ),
    setCustomSections: useCallback(
      (c: CustomSection[]) => dispatch({ type: "SET_CUSTOM_SECTIONS", payload: c }),
      [dispatch],
    ),
    setSectionOrder: useCallback(
      (o: SectionKey[]) => dispatch({ type: "SET_SECTION_ORDER", payload: o }),
      [dispatch],
    ),
    toggleSection: useCallback(
      (s: SectionKey) => dispatch({ type: "TOGGLE_SECTION", payload: s }),
      [dispatch],
    ),
    setTemplate: useCallback(
      (t: TemplateId) => dispatch({ type: "SET_TEMPLATE", payload: t }),
      [dispatch],
    ),
    setStyle: useCallback(
      (s: Partial<ResumeStyle>) => dispatch({ type: "SET_STYLE", payload: s }),
      [dispatch],
    ),
  };
}
