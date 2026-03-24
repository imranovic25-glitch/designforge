/* ═══════════════════════════════════════════════════════════════════════
 * Creative Clean — Modern single-column with timeline experience,
 * tag-style skills, and subtle accent touches.
 * ═══════════════════════════════════════════════════════════════════════ */

import { type ResumeData, FONT_STACKS } from "@/src/lib/resume-types";

export function CreativeClean({ data }: { data: ResumeData }) {
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
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 * ss, marginTop: 24 * ss }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 }} />
      <h2 style={{ fontSize: 15 * fs, fontWeight: 700, color: "#1e293b", letterSpacing: "0.03em" }}>{children}</h2>
      <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
    </div>
  );

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <div key={key}>
            <SectionTitle>Profile</SectionTitle>
            <p style={{ fontSize: 12.5 * fs, lineHeight: ls * 1.05, color: "#475569", paddingLeft: 20 }}>{data.summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key={key}>
            <SectionTitle>Experience</SectionTitle>
            <div style={{ position: "relative", paddingLeft: 20 }}>
              {/* Timeline line */}
              <div style={{ position: "absolute", left: 3, top: 4, bottom: 4, width: 2, background: `${accent}20`, borderRadius: 1 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 * ss }}>
                {experience.map((exp) => (
                  <div key={exp.id} style={{ position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{ position: "absolute", left: -20, top: 5, width: 8, height: 8, borderRadius: "50%", background: "white", border: `2px solid ${accent}` }} />
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                      <h3 style={{ fontSize: 14 * fs, fontWeight: 600, color: "#1e293b" }}>{exp.position}</h3>
                      <span style={{ fontSize: 11 * fs, color: "#94a3b8", fontWeight: 500, padding: "2px 8px", background: "#f1f5f9", borderRadius: 4 }}>
                        {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : exp.current ? " — Present" : ""}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5 * fs, color: accent, fontWeight: 500, marginTop: 2 }}>{exp.company}</p>
                    {exp.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#475569", marginTop: 6, whiteSpace: "pre-line" }}>{exp.description}</p>}
                    {exp.highlights.filter(Boolean).length > 0 && (
                      <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                        {exp.highlights.filter(Boolean).map((h, i) => (
                          <li key={i} style={{ fontSize: 12 * fs, lineHeight: ls, color: "#475569", marginBottom: 2 }}>
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null;

      case "education":
        return education.length > 0 ? (
          <div key={key}>
            <SectionTitle>Education</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 * ss, paddingLeft: 20 }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 13.5 * fs, fontWeight: 600, color: "#1e293b" }}>{edu.degree}{edu.field ? `, ${edu.field}` : ""}</h3>
                    <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>{edu.startDate}{edu.endDate ? ` — ${edu.endDate}` : ""}</span>
                  </div>
                  <p style={{ fontSize: 12.5 * fs, color: accent }}>{edu.institution}{edu.gpa ? ` — GPA ${edu.gpa}` : ""}</p>
                  {edu.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#475569", marginTop: 3 }}>{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <div key={key}>
            <SectionTitle>Skills</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 20 }}>
              {skills.map((s) => (
                <span key={s.id} style={{
                  fontSize: 11.5 * fs,
                  fontWeight: 500,
                  padding: "4px 12px",
                  borderRadius: 20,
                  background: `${accent}${Math.round(8 + (s.level / 5) * 14).toString(16).padStart(2, "0")}`,
                  color: accent,
                  border: `1px solid ${accent}20`,
                }}>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 14 * ss, paddingLeft: 20 }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <h3 style={{ fontSize: 13.5 * fs, fontWeight: 600, color: "#1e293b" }}>{proj.name}</h3>
                  {proj.url && <p style={{ fontSize: 11 * fs, color: accent }}>{proj.url}</p>}
                  {proj.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#475569", marginTop: 3 }}>{proj.description}</p>}
                  {proj.technologies.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                      {proj.technologies.map((t) => (
                        <span key={t} style={{ fontSize: 10.5 * fs, padding: "1px 8px", borderRadius: 3, background: "#f1f5f9", color: "#64748b" }}>{t}</span>
                      ))}
                    </div>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 * ss, paddingLeft: 20 }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5 * fs, fontWeight: 500, color: "#1e293b" }}>{c.name}{c.issuer ? ` — ${c.issuer}` : ""}</span>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingLeft: 20 }}>
              {languages.map((l) => (
                <div key={l.id} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `2px solid ${accent}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10 * fs, fontWeight: 600, color: accent,
                    margin: "0 auto 4px",
                  }}>
                    {l.proficiency.slice(0, 3).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 11.5 * fs, color: "#334155" }}>{l.name}</span>
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
                <SectionTitle>{sec.title}</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 * ss, paddingLeft: 20 }}>
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: 13 * fs, color: "#1e293b" }}>{item.title}</strong>
                        {item.date && <span style={{ fontSize: 11 * fs, color: "#94a3b8" }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <p style={{ fontSize: 12 * fs, color: accent }}>{item.subtitle}</p>}
                      {item.description && <p style={{ fontSize: 12 * fs, lineHeight: ls, color: "#475569", marginTop: 2 }}>{item.description}</p>}
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
    <div style={{ fontFamily: font, background: "white", padding: "36px 40px", minHeight: "100%" }}>
      {/* Header — accent left border block */}
      {vis.personal && (
        <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 18, marginBottom: 24 * ss }}>
          <h1 style={{ fontSize: 28 * fs, fontWeight: 800, color: "#1e293b", lineHeight: 1.1 }}>{p.fullName || "Your Name"}</h1>
          {p.jobTitle && <p style={{ fontSize: 14 * fs, color: accent, fontWeight: 500, marginTop: 4 }}>{p.jobTitle}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 8, fontSize: 11.5 * fs, color: "#64748b" }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.website && <span>{p.website}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
        </div>
      )}

      {order.map(renderSection)}
    </div>
  );
}
