/* ═══════════════════════════════════════════════════════════════════════
 * Compact Premium — Space-efficient, two-column sections where
 * appropriate, smaller base size, fits maximum content per page.
 * ═══════════════════════════════════════════════════════════════════════ */

import { type ResumeData, FONT_STACKS } from "@/src/lib/resume-types";

export function CompactPremium({ data }: { data: ResumeData }) {
  const { personal: p, style } = data;
  const font = FONT_STACKS[style.fontFamily];
  const accent = style.accentColor;
  const fs = style.fontSize * 0.92; // slightly smaller base for compact
  const ls = style.lineSpacing;
  const ss = style.sectionSpacing * 0.85;
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
    <h2 style={{
      fontSize: 11 * fs, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.14em", color: "white",
      background: accent, padding: "3px 10px", borderRadius: 2,
      marginBottom: 8 * ss, marginTop: 16 * ss,
      display: "inline-block",
    }}>
      {children}
    </h2>
  );

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <div key={key}>
            <SectionTitle>Summary</SectionTitle>
            <p style={{ fontSize: 11.5 * fs, lineHeight: ls, color: "#475569" }}>{data.summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key={key}>
            <SectionTitle>Experience</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 * ss }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
                    <span>
                      <strong style={{ fontSize: 12.5 * fs, color: "#1e293b" }}>{exp.position}</strong>
                      <span style={{ fontSize: 12 * fs, color: accent, fontWeight: 500 }}> at {exp.company}</span>
                    </span>
                    <span style={{ fontSize: 10 * fs, color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                    </span>
                  </div>
                  {exp.description && <p style={{ fontSize: 11 * fs, lineHeight: ls, color: "#475569", marginTop: 3, whiteSpace: "pre-line" }}>{exp.description}</p>}
                  {exp.highlights.filter(Boolean).length > 0 && (
                    <ul style={{ margin: "3px 0 0", paddingLeft: 14 }}>
                      {exp.highlights.filter(Boolean).map((h, i) => (
                        <li key={i} style={{ fontSize: 11 * fs, lineHeight: ls, color: "#475569" }}>{h}</li>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 * ss }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 12 * fs, color: "#1e293b" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                    <span style={{ fontSize: 11.5 * fs, color: "#64748b" }}> — {edu.institution}{edu.gpa ? ` (GPA ${edu.gpa})` : ""}</span>
                  </div>
                  <span style={{ fontSize: 10 * fs, color: "#94a3b8", whiteSpace: "nowrap" }}>{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <div key={key}>
            <SectionTitle>Skills</SectionTitle>
            {/* Two-column grid for compact layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
              {skills.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11.5 * fs, color: "#334155" }}>{s.name}</span>
                  <div style={{ flex: 1, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i < s.level ? accent : "#e2e8f0" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <div key={key}>
            <SectionTitle>Projects</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: projects.length > 2 ? "1fr 1fr" : "1fr", gap: "8px 20px" }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <strong style={{ fontSize: 12 * fs, color: "#1e293b" }}>{proj.name}</strong>
                  {proj.description && <p style={{ fontSize: 11 * fs, lineHeight: ls, color: "#475569", marginTop: 2 }}>{proj.description}</p>}
                  {proj.technologies.length > 0 && (
                    <p style={{ fontSize: 10 * fs, color: "#94a3b8", marginTop: 2 }}>
                      {proj.technologies.join(" · ")}
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ fontSize: 11.5 * fs }}>
                  <strong style={{ color: "#1e293b" }}>{c.name}</strong>
                  {c.issuer && <span style={{ color: "#94a3b8" }}> — {c.issuer}</span>}
                  {c.date && <span style={{ color: "#94a3b8" }}> ({c.date})</span>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "languages":
        return languages.length > 0 ? (
          <div key={key}>
            <SectionTitle>Languages</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 11.5 * fs }}>
              {languages.map((l) => (
                <span key={l.id} style={{ color: "#334155" }}>
                  {l.name} <span style={{ color: "#94a3b8" }}>({l.proficiency})</span>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 6 * ss }}>
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: 12 * fs, color: "#1e293b" }}>{item.title}</strong>
                        {item.date && <span style={{ fontSize: 10 * fs, color: "#94a3b8" }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <span style={{ fontSize: 11 * fs, color: accent }}>{item.subtitle}</span>}
                      {item.description && <p style={{ fontSize: 11 * fs, lineHeight: ls, color: "#475569", marginTop: 1 }}>{item.description}</p>}
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
    <div style={{ fontFamily: font, background: "white", padding: "28px 32px", minHeight: "100%" }}>
      {/* Compact header with accent bar */}
      {vis.personal && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 24 * fs, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}>{p.fullName || "Your Name"}</h1>
              {p.jobTitle && <p style={{ fontSize: 13 * fs, color: accent, fontWeight: 600, marginTop: 2 }}>{p.jobTitle}</p>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px", fontSize: 10.5 * fs, color: "#64748b", textAlign: "right" }}>
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>{p.phone}</span>}
              {p.location && <span>{p.location}</span>}
              {p.website && <span>{p.website}</span>}
              {p.linkedin && <span>{p.linkedin}</span>}
            </div>
          </div>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}40)`, borderRadius: 2, margin: "10px 0 6px" }} />
        </>
      )}

      {order.map(renderSection)}
    </div>
  );
}
