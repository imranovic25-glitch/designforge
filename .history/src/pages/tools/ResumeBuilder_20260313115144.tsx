import { useState, useRef, type ComponentType, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { Button } from "@/src/components/ui/button";
import {
  User, Briefcase, GraduationCap, Wrench, Plus, Trash2, Download, Eye, EyeOff,
  Mail, Phone, MapPin, Globe, Linkedin
} from "lucide-react";

interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
}

const emptyExperience = (): Experience => ({
  id: crypto.randomUUID(),
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
});

const emptyEducation = (): Education => ({
  id: crypto.randomUUID(),
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
});

const initialData: ResumeData = {
  fullName: "",
  jobTitle: "",
  email: "",
  phone: "",
  location: "",
  website: "",
  linkedin: "",
  summary: "",
  experience: [emptyExperience()],
  education: [emptyEducation()],
  skills: "",
};

function Input({ label, icon: Icon, ...props }: { label: string; icon?: ComponentType<{ className?: string }> } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />}
        <input
          {...props}
          className={`w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors text-sm ${Icon ? "pl-11 pr-4" : "px-4"}`}
        />
      </div>
    </div>
  );
}

function Textarea({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-white/50 uppercase tracking-widest">{label}</label>
      <textarea
        {...props}
        className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors text-sm p-4 min-h-[100px] resize-y"
      />
    </div>
  );
}

/* ── Premium Resume Template (Preview + Print) ────────────────────────── */
function ResumePreview({ data }: { data: ResumeData }) {
  const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div
      id="resume-preview"
      className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white px-10 py-10">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(16,185,129,.4), transparent 50%)" }} />
        <div className="relative z-10">
          <h1 className="text-4xl font-bold tracking-tight mb-1">
            {data.fullName || "Your Full Name"}
          </h1>
          <p className="text-lg text-emerald-300 font-medium mb-6">
            {data.jobTitle || "Professional Title"}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {data.email && (
              <span className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                {data.email}
              </span>
            )}
            {data.phone && (
              <span className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                {data.phone}
              </span>
            )}
            {data.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                {data.location}
              </span>
            )}
            {data.website && (
              <span className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-emerald-400" />
                {data.website}
              </span>
            )}
            {data.linkedin && (
              <span className="flex items-center gap-2">
                <Linkedin className="h-3.5 w-3.5 text-emerald-400" />
                {data.linkedin}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-10 py-8 space-y-8">
        {/* Summary */}
        {data.summary && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4">
              Professional Summary
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.some((e) => e.company || e.role) && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4">
              Work Experience
            </h2>
            <div className="space-y-6">
              {data.experience
                .filter((e) => e.company || e.role)
                .map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900">{exp.role}</h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {exp.startDate}
                        {exp.endDate ? ` — ${exp.endDate}` : exp.startDate ? " — Present" : ""}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-emerald-700 mb-2">{exp.company}</p>
                    {exp.description && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.some((e) => e.institution || e.degree) && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4">
              Education
            </h2>
            <div className="space-y-4">
              {data.education
                .filter((e) => e.institution || e.degree)
                .map((edu) => (
                  <div key={edu.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {edu.degree}{edu.field ? `, ${edu.field}` : ""}
                      </h3>
                      <span className="text-xs text-gray-400 font-medium">
                        {edu.startDate}
                        {edu.endDate ? ` — ${edu.endDate}` : edu.startDate ? " — Present" : ""}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-emerald-700">{edu.institution}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-700 border-b-2 border-emerald-200 pb-2 mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer accent */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />
    </div>
  );
}

/* ── Main Component ───────────────────────────────────────────────────── */
export function ResumeBuilder() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof ResumeData>(key: K, val: ResumeData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const updateExperience = (id: string, field: keyof Experience, value: string) =>
    set("experience", data.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const updateEducation = (id: string, field: keyof Education, value: string) =>
    set("education", data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const handlePrint = () => {
    const el = document.getElementById("resume-preview");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${data.fullName || "Resume"}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"><\/script>
<style>@page { margin: 0; } body { margin: 0; font-family: 'Inter', sans-serif; }</style>
</head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 600);
  };

  return (
    <ToolLayout
      title="Resume Builder"
      description="Build a premium, ATS-friendly resume in minutes. Fill in your details and download a polished, print-ready template."
      relatedComparisons={[{ title: "Best Resume Builders", path: "/comparisons/best-resume-builders" }]}
      relatedGuides={[{ title: "How to Choose a Resume Builder", path: "/guides/how-to-choose-a-resume-builder" }]}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-white">Fill Your Details</h2>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-full border-white/20 text-white hover:bg-white/10"
            onClick={() => setShowPreview((p) => !p)}
          >
            {showPreview ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white"
            onClick={handlePrint}
          >
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {showPreview ? (
        <div ref={previewRef}>
          <ResumePreview data={data} />
        </div>
      ) : (
        <div className="space-y-12">
          {/* ── Personal Information ─────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input icon={User} label="Full Name" placeholder="John Doe" value={data.fullName} onChange={(e) => set("fullName", e.target.value)} />
              <Input icon={Briefcase} label="Job Title" placeholder="Senior Software Engineer" value={data.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
              <Input icon={Mail} label="Email" placeholder="john@example.com" type="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
              <Input icon={Phone} label="Phone" placeholder="+1 (555) 123-4567" type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
              <Input icon={MapPin} label="Location" placeholder="San Francisco, CA" value={data.location} onChange={(e) => set("location", e.target.value)} />
              <Input icon={Globe} label="Website" placeholder="https://johndoe.com" value={data.website} onChange={(e) => set("website", e.target.value)} />
              <Input icon={Linkedin} label="LinkedIn" placeholder="linkedin.com/in/johndoe" value={data.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
            </div>
          </section>

          {/* ── Professional Summary ─────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Professional Summary</h3>
            </div>
            <Textarea label="Summary" placeholder="A brief overview of your professional background, key achievements, and career goals..." value={data.summary} onChange={(e) => set("summary", e.target.value)} />
          </section>

          {/* ── Work Experience ───────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Work Experience</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => set("experience", [...data.experience, emptyExperience()])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-6">
              {data.experience.map((exp, i) => (
                <div key={exp.id} className="glass-panel rounded-2xl p-6 relative group">
                  {data.experience.length > 1 && (
                    <button
                      className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => set("experience", data.experience.filter((e) => e.id !== exp.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <p className="text-xs font-medium text-white/30 mb-4">Experience {i + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Company" placeholder="Acme Corp" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                    <Input label="Role" placeholder="Software Engineer" value={exp.role} onChange={(e) => updateExperience(exp.id, "role", e.target.value)} />
                    <Input label="Start Date" placeholder="Jan 2022" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                    <Input label="End Date" placeholder="Present" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                  </div>
                  <div className="mt-5">
                    <Textarea label="Description" placeholder="Key responsibilities and achievements..." value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Education ─────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Education</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => set("education", [...data.education, emptyEducation()])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-6">
              {data.education.map((edu, i) => (
                <div key={edu.id} className="glass-panel rounded-2xl p-6 relative group">
                  {data.education.length > 1 && (
                    <button
                      className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => set("education", data.education.filter((e) => e.id !== edu.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <p className="text-xs font-medium text-white/30 mb-4">Education {i + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Institution" placeholder="MIT" value={edu.institution} onChange={(e) => updateEducation(edu.id, "institution", e.target.value)} />
                    <Input label="Degree" placeholder="Bachelor of Science" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                    <Input label="Field of Study" placeholder="Computer Science" value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                    <Input label="Start Date" placeholder="2018" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                    <Input label="End Date" placeholder="2022" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Skills ────────────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Skills</h3>
            </div>
            <Textarea label="Skills (comma-separated)" placeholder="React, TypeScript, Node.js, AWS, CI/CD, Agile, GraphQL" value={data.skills} onChange={(e) => set("skills", e.target.value)} />
          </section>
        </div>
      )}
    </ToolLayout>
  );
}
