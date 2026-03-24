/* ═══════════════════════════════════════════════════════════════════════
 * Modern Sidebar — Two-column layout with colored left sidebar.
 * Sidebar: personal info, skills, languages, certifications.
 * Main: summary, experience, education, projects, custom.
 * ═══════════════════════════════════════════════════════════════════════ */

import { type ResumeData, FONT_STACKS } from "@/src/lib/resume-types";

const SIDEBAR_KEYS = new Set(["skills", "languages", "certifications"]);
const MAIN_KEYS = new Set(["summary", "experience", "education", "projects", "custom"]);

export function ModernSidebar({ data }: { data: ResumeData }) {
  const { personal: p, style } = data;
  const font = FONT_STACKS[style.fontFamily];
  const accent = style.accentColor;
  const fs = style.fontSize;
  const ls = style.lineSpacing;
  const ss = style.sectionSpacing;
  const vis = data.sectionVisibility;

  const sideOrder = data.sectionOrder.filter((k) => vis[k] && SIDEBAR_KEYS.has(k));
  const mainOrder = data.sectionOrder.filter((k) => vis[k] && MAIN_KEYS.has(k));

  const skills = data.skills.filter((s) => s.name);
  const experience = data.experience.filter((e) => e.company || e.position);
  const education = data.education.filter((e) => e.institution || e.degree);
  const projects = data.projects.filter((p) => p.name);
  const certifications = data.certifications.filter((c) => c.name);
  const languages = data.languages.filter((l) => l.name);
  const customSections = data.customSections.filter((s) => s.items.length > 0);

  /* ── Sidebar section ───────────────────────────────────────────── */

  const SideTitle = ({ children }: { children: string }) => (
    <h3 style={{ fontSize: 10.5 * fs, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 10 * ss, marginTop: 20 * ss }}>
      {children}
    </h3>
  );

  const renderSideSection = (key: string) => {
    switch (key) {
      case "skills":
        return skills.length > 0 ? (
          <div key={key}>
            <SideTitle>Skills</SideTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {skills.map((s) => (
                <div key={s.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12 * fs, color: "rgba(255,255,255,0.85)" }}>{s.name}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
                    <div style={{ width: `${(s.level / 5) * 100}%`, height: "100%", borderRadius: 2, background: "rgba(255,255,255,0.7)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "languages":
        return languages.length > 0 ? (
          <div key={key}>
            <SideTitle>Languages</SideTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {languages.map((l) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 * fs }}>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>{l.name}</span>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11 * fs }}>{l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "certifications":
        return certifications.length > 0 ? (
          <div key={key}>
            <SideTitle>Certifications</SideTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {certifications.map((c) => (
                <div key={c.id}>
                  <p style={{ fontSize: 12 * fs, fontWeight: 600, color: "rgba(255,255,255,0.85)", lineHeight: 1.3 }}>{c.name}</p>
                  {c.issuer && <p style={{ fontSize: 11 * fs, color: "rgba(255,255,255,0.45)" }}>{c.issuer}{c.date ? ` · ${c.date}` : ""}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  /* ── Main section ──────────────────────────────────────────────── */

  const MainTitle = ({ children }: { children: string }) => (
    <h2 style={{ fontSize: 13 * fs, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: accent, marginBottom: 10 * ss, marginTop: 20 * ss, borderBottom: `1.5px solid ${accent}25`, paddingBottom: 6 }}>
      {children}
    </h2>
  );

  const renderMainSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <div key={key}>
            <MainTitle>Summary</MainTitle>
            <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#4b5563" }}>{data.summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key={key}>
            <MainTitle>Experience</MainTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 * ss }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 14 * fs, fontWeight: 600, color: "#1e293b" }}>{exp.position}</h3>
                    <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>
                      {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : exp.current ? " — Present" : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5 * fs, fontWeight: 500, color: accent, marginTop: 1 }}>{exp.company}</p>
                  {exp.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#4b5563", marginTop: 5, whiteSpace: "pre-line" }}>{exp.description}</p>}
                  {exp.highlights.filter(Boolean).length > 0 && (
                    <ul style={{ marginTop: 4, paddingLeft: 16 }}>
                      {exp.highlights.filter(Boolean).map((h, i) => (
                        <li key={i} style={{ fontSize: 12 * fs, lineHeight: ls, color: "#4b5563", marginBottom: 2 }}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "education":
        return education.length > 0 ? (
          <div key={key}>
            <MainTitle>Education</MainTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * ss }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 13.5 * fs, fontWeight: 600, color: "#1e293b" }}>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</h3>
                    <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</span>
                  </div>
                  <p style={{ fontSize: 12.5 * fs, color: accent, marginTop: 1 }}>{edu.institution}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                  {edu.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#4b5563", marginTop: 3 }}>{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <div key={key}>
            <MainTitle>Projects</MainTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * ss }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <h3 style={{ fontSize: 13.5 * fs, fontWeight: 600, color: "#1e293b" }}>{proj.name}</h3>
                  {proj.url && <p style={{ fontSize: 11 * fs, color: accent }}>{proj.url}</p>}
                  {proj.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#4b5563", marginTop: 3 }}>{proj.description}</p>}
                  {proj.technologies.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                      {proj.technologies.map((t) => (
                        <span key={t} style={{ fontSize: 10.5 * fs, padding: "2px 8px", borderRadius: 4, background: `${accent}10`, color: accent }}>{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "custom":
        return customSections.length > 0 ? (
          <div key={key}>
            {customSections.map((sec) => (
              <div key={sec.id}>
                <MainTitle>{sec.title}</MainTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 * ss }}>
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: 13 * fs, color: "#1e293b" }}>{item.title}</strong>
                        {item.date && <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <p style={{ fontSize: 12 * fs, color: accent }}>{item.subtitle}</p>}
                      {item.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#4b5563", marginTop: 2 }}>{item.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: font, background: "white", display: "flex", minHeight: "100%" }}>
      {/* Sidebar */}
      <div style={{ width: "32%", background: accent, padding: "36px 24px", color: "white", flexShrink: 0 }}>
        {vis.personal && (
          <div style={{ marginBottom: 24 * ss }}>
            <h1 style={{ fontSize: 22 * fs, fontWeight: 700, lineHeight: 1.2, color: "white" }}>{p.fullName || "Your Name"}</h1>
            {p.jobTitle && <p style={{ fontSize: 12 * fs, fontWeight: 500, color: "rgba(255,255,255,0.7)", marginTop: 6, letterSpacing: "0.04em" }}>{p.jobTitle}</p>}
            <div style={{ height: 1, background: "rgba(255,255,255,0.2)", margin: "16px 0" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11 * fs, color: "rgba(255,255,255,0.7)" }}>
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.location && <span>{p.location}</span>}
              {p.website && <span style={{ wordBreak: "break-all" }}>{p.website}</span>}
              {p.linkedin && <span style={{ wordBreak: "break-all" }}>{p.linkedin}</span>}
            </div>
          </div>
        )}
        {sideOrder.map(renderSideSection)}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "36px 32px" }}>
        {mainOrder.map(renderMainSection)}
      </div>
    </div>
  );
}
