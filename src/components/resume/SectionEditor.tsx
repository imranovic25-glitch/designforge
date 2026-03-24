/* ═══════════════════════════════════════════════════════════════════════
 * SectionEditor — Centre panel, renders the editor for the active section
 * ═══════════════════════════════════════════════════════════════════════ */

import {
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type ComponentType,
} from "react";
import { useResume, useResumeActions } from "@/src/lib/resume-store";
import {
  type SectionKey,
  type WorkExperience,
  type Education,
  type Skill,
  type Project,
  type Certification,
  type Language,
  type CustomSection,
  type CustomItem,
  emptyExperience,
  emptyEducation,
  emptySkill,
  emptyProject,
  emptyCertification,
  emptyLanguage,
  emptyCustomSection,
  emptyCustomItem,
  SECTION_META,
} from "@/src/lib/resume-types";
import {
  User, Mail, Phone, MapPin, Globe, Linkedin, Briefcase,
  GraduationCap, Wrench, FolderOpen, Award, Plus, Trash2,
  ChevronDown, ChevronUp, FileText, LayoutList,
} from "lucide-react";
import { useState } from "react";

/* ── Shared form primitives ──────────────────────────────────────────── */

function Field({
  label, icon: Icon, ...props
}: { label: string; icon?: ComponentType<{ className?: string }> } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-white/40 uppercase tracking-widest">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />}
        <input
          {...props}
          className={`w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-white/10 transition-all ${Icon ? "pl-10 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

function Area({
  label, rows = 4, ...props
}: { label: string; rows?: number } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-white/40 uppercase tracking-widest">{label}</label>
      <textarea
        rows={rows}
        {...props}
        className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-white/20 focus:border-white/25 focus:bg-white/[0.06] focus:outline-none focus:ring-1 focus:ring-white/10 transition-all p-4 resize-y leading-relaxed"
      />
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
        <Icon className="h-5 w-5 text-white/60" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/15 text-sm text-white/50 hover:text-white/70 hover:border-white/25 hover:bg-white/[0.03] transition-all w-full justify-center"
    >
      <Plus className="h-4 w-4" /> {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-4 right-4 p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

/* Collapsible card for repeatable items */
function ItemCard({
  label, defaultOpen = true, onRemove, children,
}: { label: string; defaultOpen?: boolean; onRemove?: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] relative group transition-colors hover:border-white/[0.1]">
      <button
        className="flex items-center justify-between w-full px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-white/60">{label}</span>
        {open ? <ChevronUp className="h-4 w-4 text-white/30" /> : <ChevronDown className="h-4 w-4 text-white/30" />}
      </button>
      {onRemove && <RemoveButton onClick={onRemove} />}
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

/* ── Per-section editors ─────────────────────────────────────────────── */

function PersonalEditor() {
  const { resume } = useResume();
  const { setPersonal } = useResumeActions();
  const p = resume.personal;
  return (
    <>
      <SectionHeader icon={User} title="Personal Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field icon={User} label="Full Name" placeholder="John Doe" value={p.fullName} onChange={(e) => setPersonal({ fullName: e.target.value })} />
        <Field icon={Briefcase} label="Job Title" placeholder="Senior Software Engineer" value={p.jobTitle} onChange={(e) => setPersonal({ jobTitle: e.target.value })} />
        <Field icon={Mail} label="Email" placeholder="john@example.com" type="email" value={p.email} onChange={(e) => setPersonal({ email: e.target.value })} />
        <Field icon={Phone} label="Phone" placeholder="+1 (555) 123-4567" value={p.phone} onChange={(e) => setPersonal({ phone: e.target.value })} />
        <Field icon={MapPin} label="Location" placeholder="San Francisco, CA" value={p.location} onChange={(e) => setPersonal({ location: e.target.value })} />
        <Field icon={Globe} label="Website" placeholder="https://johndoe.com" value={p.website} onChange={(e) => setPersonal({ website: e.target.value })} />
        <Field icon={Linkedin} label="LinkedIn" placeholder="linkedin.com/in/johndoe" value={p.linkedin} onChange={(e) => setPersonal({ linkedin: e.target.value })} />
      </div>
    </>
  );
}

function SummaryEditor() {
  const { resume } = useResume();
  const { setSummary } = useResumeActions();
  return (
    <>
      <SectionHeader icon={FileText} title="Professional Summary" />
      <Area
        label="Summary"
        rows={6}
        placeholder="A brief overview of your professional background, key achievements, and career goals..."
        value={resume.summary}
        onChange={(e) => setSummary(e.target.value)}
      />
    </>
  );
}

function ExperienceEditor() {
  const { resume } = useResume();
  const { setExperience } = useResumeActions();
  const items = resume.experience;

  const update = (id: string, patch: Partial<WorkExperience>) =>
    setExperience(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const updateHighlight = (id: string, idx: number, val: string) =>
    setExperience(
      items.map((x) =>
        x.id === id ? { ...x, highlights: x.highlights.map((h, i) => (i === idx ? val : h)) } : x,
      ),
    );

  return (
    <>
      <SectionHeader icon={Briefcase} title="Work Experience" />
      <div className="space-y-4">
        {items.map((exp, i) => (
          <ItemCard
            key={exp.id}
            label={exp.position ? `${exp.position} at ${exp.company}` : `Experience ${i + 1}`}
            defaultOpen={i === 0}
            onRemove={items.length > 1 ? () => setExperience(items.filter((x) => x.id !== exp.id)) : undefined}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company" placeholder="Acme Corp" value={exp.company} onChange={(e) => update(exp.id, { company: e.target.value })} />
              <Field label="Position" placeholder="Software Engineer" value={exp.position} onChange={(e) => update(exp.id, { position: e.target.value })} />
              <Field label="Start Date" placeholder="Jan 2022" value={exp.startDate} onChange={(e) => update(exp.id, { startDate: e.target.value })} />
              <Field label="End Date" placeholder="Present" value={exp.endDate} onChange={(e) => update(exp.id, { endDate: e.target.value })} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) => update(exp.id, { current: e.target.checked, endDate: e.target.checked ? "" : exp.endDate })}
                className="rounded border-white/20 bg-white/5 text-teal-500 focus:ring-teal-500/30 h-4 w-4"
              />
              <span className="text-xs text-white/40">I currently work here</span>
            </div>
            <Area label="Description" rows={3} placeholder="Key responsibilities and achievements..." value={exp.description} onChange={(e) => update(exp.id, { description: e.target.value })} />
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Key Highlights</label>
              {exp.highlights.map((h, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    value={h}
                    onChange={(e) => updateHighlight(exp.id, idx, e.target.value)}
                    placeholder="Achievement or responsibility"
                    className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm px-3 placeholder:text-white/20 focus:border-white/25 focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => update(exp.id, { highlights: exp.highlights.filter((_, j) => j !== idx) })}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => update(exp.id, { highlights: [...exp.highlights, ""] })}
                className="text-xs text-white/40 hover:text-white/60 flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add highlight
              </button>
            </div>
          </ItemCard>
        ))}
        <AddButton onClick={() => setExperience([...items, emptyExperience()])} label="Add Experience" />
      </div>
    </>
  );
}

function EducationEditor() {
  const { resume } = useResume();
  const { setEducation } = useResumeActions();
  const items = resume.education;

  const update = (id: string, patch: Partial<Education>) =>
    setEducation(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <>
      <SectionHeader icon={GraduationCap} title="Education" />
      <div className="space-y-4">
        {items.map((edu, i) => (
          <ItemCard
            key={edu.id}
            label={edu.degree ? `${edu.degree}${edu.field ? ` in ${edu.field}` : ""}` : `Education ${i + 1}`}
            defaultOpen={i === 0}
            onRemove={items.length > 1 ? () => setEducation(items.filter((x) => x.id !== edu.id)) : undefined}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Institution" placeholder="MIT" value={edu.institution} onChange={(e) => update(edu.id, { institution: e.target.value })} />
              <Field label="Degree" placeholder="Bachelor of Science" value={edu.degree} onChange={(e) => update(edu.id, { degree: e.target.value })} />
              <Field label="Field of Study" placeholder="Computer Science" value={edu.field} onChange={(e) => update(edu.id, { field: e.target.value })} />
              <Field label="GPA" placeholder="3.8 / 4.0" value={edu.gpa} onChange={(e) => update(edu.id, { gpa: e.target.value })} />
              <Field label="Start Date" placeholder="2018" value={edu.startDate} onChange={(e) => update(edu.id, { startDate: e.target.value })} />
              <Field label="End Date" placeholder="2022" value={edu.endDate} onChange={(e) => update(edu.id, { endDate: e.target.value })} />
            </div>
            <Area label="Description" rows={2} placeholder="Relevant coursework, honors, activities..." value={edu.description} onChange={(e) => update(edu.id, { description: e.target.value })} />
          </ItemCard>
        ))}
        <AddButton onClick={() => setEducation([...items, emptyEducation()])} label="Add Education" />
      </div>
    </>
  );
}

function SkillsEditor() {
  const { resume } = useResume();
  const { setSkills } = useResumeActions();
  const items = resume.skills;

  const update = (id: string, patch: Partial<Skill>) =>
    setSkills(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const LEVELS = [1, 2, 3, 4, 5] as const;

  return (
    <>
      <SectionHeader icon={Wrench} title="Skills" />
      <div className="space-y-3">
        {items.map((skill) => (
          <div key={skill.id} className="flex items-center gap-3 group">
            <input
              value={skill.name}
              onChange={(e) => update(skill.id, { name: e.target.value })}
              placeholder="Skill name"
              className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm px-3 placeholder:text-white/20 focus:border-white/25 focus:outline-none transition-all"
            />
            <div className="flex gap-1">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => update(skill.id, { level: l })}
                  className={`h-2.5 w-6 rounded-full transition-colors ${
                    l <= skill.level ? "bg-teal-500" : "bg-white/10"
                  }`}
                  title={`Level ${l}`}
                />
              ))}
            </div>
            <button
              onClick={() => setSkills(items.filter((x) => x.id !== skill.id))}
              className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <AddButton onClick={() => setSkills([...items, emptySkill()])} label="Add Skill" />
      </div>
    </>
  );
}

function ProjectsEditor() {
  const { resume } = useResume();
  const { setProjects } = useResumeActions();
  const items = resume.projects;

  const update = (id: string, patch: Partial<Project>) =>
    setProjects(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <>
      <SectionHeader icon={FolderOpen} title="Projects" />
      <div className="space-y-4">
        {items.map((proj, i) => (
          <ItemCard
            key={proj.id}
            label={proj.name || `Project ${i + 1}`}
            defaultOpen={i === 0}
            onRemove={() => setProjects(items.filter((x) => x.id !== proj.id))}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Project Name" placeholder="My App" value={proj.name} onChange={(e) => update(proj.id, { name: e.target.value })} />
              <Field label="URL" placeholder="https://github.com/..." value={proj.url} onChange={(e) => update(proj.id, { url: e.target.value })} />
            </div>
            <Area label="Description" rows={3} placeholder="What the project does and your role..." value={proj.description} onChange={(e) => update(proj.id, { description: e.target.value })} />
            <Field
              label="Technologies (comma-separated)"
              placeholder="React, TypeScript, AWS"
              value={proj.technologies.join(", ")}
              onChange={(e) => update(proj.id, { technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
          </ItemCard>
        ))}
        <AddButton onClick={() => setProjects([...items, emptyProject()])} label="Add Project" />
      </div>
    </>
  );
}

function CertificationsEditor() {
  const { resume } = useResume();
  const { setCertifications } = useResumeActions();
  const items = resume.certifications;

  const update = (id: string, patch: Partial<Certification>) =>
    setCertifications(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <>
      <SectionHeader icon={Award} title="Certifications" />
      <div className="space-y-4">
        {items.map((cert, i) => (
          <ItemCard
            key={cert.id}
            label={cert.name || `Certification ${i + 1}`}
            defaultOpen={i === 0}
            onRemove={() => setCertifications(items.filter((x) => x.id !== cert.id))}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Certification Name" placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => update(cert.id, { name: e.target.value })} />
              <Field label="Issuer" placeholder="Amazon Web Services" value={cert.issuer} onChange={(e) => update(cert.id, { issuer: e.target.value })} />
              <Field label="Date" placeholder="June 2023" value={cert.date} onChange={(e) => update(cert.id, { date: e.target.value })} />
              <Field label="URL" placeholder="https://credential.net/..." value={cert.url} onChange={(e) => update(cert.id, { url: e.target.value })} />
            </div>
          </ItemCard>
        ))}
        <AddButton onClick={() => setCertifications([...items, emptyCertification()])} label="Add Certification" />
      </div>
    </>
  );
}

function LanguagesEditor() {
  const { resume } = useResume();
  const { setLanguages } = useResumeActions();
  const items = resume.languages;
  const PROF = ["beginner", "intermediate", "advanced", "fluent", "native"] as const;

  const update = (id: string, patch: Partial<Language>) =>
    setLanguages(items.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <>
      <SectionHeader icon={Globe} title="Languages" />
      <div className="space-y-3">
        {items.map((lang) => (
          <div key={lang.id} className="flex items-center gap-3 group">
            <input
              value={lang.name}
              onChange={(e) => update(lang.id, { name: e.target.value })}
              placeholder="Language"
              className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm px-3 placeholder:text-white/20 focus:border-white/25 focus:outline-none transition-all"
            />
            <select
              value={lang.proficiency}
              onChange={(e) => update(lang.id, { proficiency: e.target.value as Language["proficiency"] })}
              className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm px-3 focus:border-white/25 focus:outline-none transition-all appearance-none cursor-pointer"
            >
              {PROF.map((p) => (
                <option key={p} value={p} className="bg-zinc-900 text-white">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <button
              onClick={() => setLanguages(items.filter((x) => x.id !== lang.id))}
              className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <AddButton onClick={() => setLanguages([...items, emptyLanguage()])} label="Add Language" />
      </div>
    </>
  );
}

function CustomSectionsEditor() {
  const { resume } = useResume();
  const { setCustomSections } = useResumeActions();
  const sections = resume.customSections;

  const updateSection = (id: string, patch: Partial<CustomSection>) =>
    setCustomSections(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const updateItem = (sectionId: string, itemId: string, patch: Partial<CustomItem>) =>
    setCustomSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : s,
      ),
    );

  return (
    <>
      <SectionHeader icon={LayoutList} title="Custom Sections" />
      <div className="space-y-6">
        {sections.map((sec) => (
          <div key={sec.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={sec.title}
                onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                placeholder="Section Title"
                className="flex-1 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm px-3 font-medium placeholder:text-white/20 focus:border-white/25 focus:outline-none transition-all"
              />
              <button
                onClick={() => setCustomSections(sections.filter((s) => s.id !== sec.id))}
                className="text-white/20 hover:text-red-400 transition-colors p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {sec.items.map((item, i) => (
              <ItemCard
                key={item.id}
                label={item.title || `Item ${i + 1}`}
                defaultOpen={i === 0}
                onRemove={() => updateSection(sec.id, { items: sec.items.filter((x) => x.id !== item.id) })}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Title" placeholder="Item title" value={item.title} onChange={(e) => updateItem(sec.id, item.id, { title: e.target.value })} />
                  <Field label="Subtitle" placeholder="Subtitle" value={item.subtitle} onChange={(e) => updateItem(sec.id, item.id, { subtitle: e.target.value })} />
                  <Field label="Date" placeholder="2023" value={item.date} onChange={(e) => updateItem(sec.id, item.id, { date: e.target.value })} />
                </div>
                <Area label="Description" rows={2} value={item.description} onChange={(e) => updateItem(sec.id, item.id, { description: e.target.value })} />
              </ItemCard>
            ))}
            <AddButton onClick={() => updateSection(sec.id, { items: [...sec.items, emptyCustomItem()] })} label="Add Item" />
          </div>
        ))}
        <AddButton onClick={() => setCustomSections([...sections, emptyCustomSection()])} label="Add Custom Section" />
      </div>
    </>
  );
}

/* ── Main Editor Switch ──────────────────────────────────────────────── */

const EDITORS: Record<SectionKey, () => JSX.Element> = {
  personal: PersonalEditor,
  summary: SummaryEditor,
  experience: ExperienceEditor,
  education: EducationEditor,
  skills: SkillsEditor,
  projects: ProjectsEditor,
  certifications: CertificationsEditor,
  languages: LanguagesEditor,
  custom: CustomSectionsEditor,
};

export function SectionEditor() {
  const { activeSection, resume } = useResume();
  const visible = resume.sectionVisibility[activeSection];
  const meta = SECTION_META[activeSection];
  const Editor = EDITORS[activeSection];

  return (
    <div className="h-full overflow-y-auto px-1">
      {!visible && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          This section is hidden from your resume. Toggle visibility in the sidebar.
        </div>
      )}
      <Editor />
    </div>
  );
}
