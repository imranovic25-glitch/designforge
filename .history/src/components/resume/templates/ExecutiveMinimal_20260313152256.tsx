/* ═══════════════════════════════════════════════════════════════════════
 * Executive Minimal — Clean, elegant, single-column with generous spacing.
 * Thin accent lines, sophisticated typography, maximum readability.
 * ═══════════════════════════════════════════════════════════════════════ */

import { type ResumeData, FONT_STACKS } from "@/src/lib/resume-types";

export function ExecutiveMinimal({ data }: { data: ResumeData }) {
  const { personal: p, style } = data;
  const font = FONT_STACKS[style.fontFamily];
  const accent = style.accentColor;
  const fs = style.fontSize;
  const ls = style.lineSpacing;
  const ss = style.sectionSpacing;
  const vis = data.sectionVisibility;
  const order = data.sectionOrder.filter((k) => vis[k] && k !== "personal");

  const skills = data.skills.filter((s) => s.name);
  const experience = data.experience.filter((e) => e.company || e.position);
  const education = data.education.filter((e) => e.institution || e.degree);
  const projects = data.projects.filter((p) => p.name);
  const certifications = data.certifications.filter((c) => c.name);
  const languages = data.languages.filter((l) => l.name);
  const customSections = data.customSections.filter((s) => s.items.length > 0);

  const SectionTitle = ({ children }: { children: string }) => (
    <div style={{ marginBottom: 12 * ss, marginTop: 20 * ss }}>
      <h2
        style={{
          fontSize: 11 * fs,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accent,
          paddingBottom: 8,
          borderBottom: `2px solid ${accent}20`,
        }}
      >
        {children}
      </h2>
    </div>
  );

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <div key={key}>
            <SectionTitle>Professional Summary</SectionTitle>
            <p style={{ fontSize: 13 * fs, lineHeight: ls, color: "#475569" }}>{data.summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key={key}>
            <SectionTitle>Work Experience</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 * ss }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                    <h3 style={{ fontSize: 14.5 * fs, fontWeight: 600, color: "#1e293b" }}>{exp.position}</h3>
                    <span style={{ fontSize: 11.5 * fs, color: "#94a3b8", fontWeight: 500 }}>
                      {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : exp.current ? " — Present" : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 13 * fs, fontWeight: 500, color: accent, marginTop: 2 }}>{exp.company}</p>
                  {exp.description && (
                    <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#64748b", marginTop: 6, whiteSpace: "pre-line" }}>{exp.description}</p>
                  )}
                  {exp.highlights.filter(Boolean).length > 0 && (
                    <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                      {exp.highlights.filter(Boolean).map((h, i) => (
                        <li key={i} style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#64748b", marginBottom: 3 }}>
                          {h}
                        </li>
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
            <SectionTitle>Education</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 * ss }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                    <h3 style={{ fontSize: 14 * fs, fontWeight: 600, color: "#1e293b" }}>
                      {edu.degree}{edu.field ? `, ${edu.field}` : ""}{edu.gpa ? ` (${edu.gpa})` : ""}
                    </h3>
                    <span style={{ fontSize: 11.5 * fs, color: "#94a3b8", fontWeight: 500 }}>
                      {edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 13 * fs, fontWeight: 500, color: accent, marginTop: 2 }}>{edu.institution}</p>
                  {edu.description && (
                    <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#64748b", marginTop: 4 }}>{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <div key={key}>
            <SectionTitle>Skills</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((s) => (
                <span
                  key={s.id}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 999,
                    fontSize: 12 * fs,
                    fontWeight: 500,
                    background: `${accent}10`,
                    color: accent,
                    border: `1px solid ${accent}25`,
                  }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <div key={key}>
            <SectionTitle>Projects</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 * ss }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <h3 style={{ fontSize: 14 * fs, fontWeight: 600, color: "#1e293b" }}>{proj.name}</h3>
                  {proj.url && <p style={{ fontSize: 11 * fs, color: accent, marginTop: 1 }}>{proj.url}</p>}
                  {proj.description && <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#64748b", marginTop: 4 }}>{proj.description}</p>}
                  {proj.technologies.length > 0 && (
                    <p style={{ fontSize: 11 * fs, color: "#94a3b8", marginTop: 4 }}>
                      <span style={{ fontWeight: 600 }}>Tech: </span>{proj.technologies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "certifications":
        return certifications.length > 0 ? (
          <div key={key}>
            <SectionTitle>Certifications</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 * ss }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontSize: 13 * fs, fontWeight: 600, color: "#1e293b" }}>{c.name}</span>
                    {c.issuer && <span style={{ fontSize: 12.5 * fs, color: "#64748b" }}> — {c.issuer}</span>}
                  </div>
                  {c.date && <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>{c.date}</span>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "languages":
        return languages.length > 0 ? (
          <div key={key}>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {languages.map((l) => (
                <span key={l.id} style={{ fontSize: 13 * fs, color: "#334155" }}>
                  <strong>{l.name}</strong> — <span style={{ color: "#64748b" }}>{l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null;

      case "custom":
        return customSections.length > 0 ? (
          <div key={key}>
            {customSections.map((sec) => (
              <div key={sec.id}>
                <SectionTitle>{sec.title}</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 * ss }}>
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <h3 style={{ fontSize: 13.5 * fs, fontWeight: 600, color: "#1e293b" }}>{item.title}</h3>
                        {item.date && <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <p style={{ fontSize: 12.5 * fs, color: accent, marginTop: 1 }}>{item.subtitle}</p>}
                      {item.description && <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#64748b", marginTop: 4 }}>{item.description}</p>}
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
    <div
      style={{
        fontFamily: font,
        background: "white",
        color: "#1e293b",
        padding: "40px 48px",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      {vis.personal && (
        <div style={{ textAlign: "center", marginBottom: 24 * ss }}>
          <h1 style={{ fontSize: 28 * fs, fontWeight: 700, letterSpacing: "-0.01em", color: "#0f172a" }}>
            {p.fullName || "Your Name"}
          </h1>
          {p.jobTitle && (
            <p style={{ fontSize: 14 * fs, fontWeight: 500, color: accent, marginTop: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {p.jobTitle}
            </p>
          )}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "6px 20px", marginTop: 12, fontSize: 11.5 * fs, color: "#64748b" }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.website && <span>{p.website}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, marginTop: 20, opacity: 0.4 }} />
        </div>
      )}

      {/* Sections */}
      {order.map(renderSection)}
    </div>
  );
}
