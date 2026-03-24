/* ═══════════════════════════════════════════════════════════════════════
 * ATS Professional — Maximum ATS compatibility, clear section headings.
 * No graphics, no columns, standard formatting. Bullet-point focused.
 * ═══════════════════════════════════════════════════════════════════════ */

import { type ResumeData, FONT_STACKS } from "@/src/lib/resume-types";

export function AtsProfessional({ data }: { data: ResumeData }) {
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

  const Hr = () => <hr style={{ border: "none", borderTop: `1.5px solid ${accent}`, margin: "4px 0 12px", opacity: 0.5 }} />;

  const SectionTitle = ({ children }: { children: string }) => (
    <div style={{ marginTop: 18 * ss }}>
      <h2 style={{ fontSize: 15 * fs, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {children}
      </h2>
      <Hr />
    </div>
  );

  const renderSection = (key: string) => {
    switch (key) {
      case "summary":
        return data.summary ? (
          <div key={key}>
            <SectionTitle>Professional Summary</SectionTitle>
            <p style={{ fontSize: 13 * fs, lineHeight: ls, color: "#374151" }}>{data.summary}</p>
          </div>
        ) : null;

      case "experience":
        return experience.length > 0 ? (
          <div key={key}>
            <SectionTitle>Work Experience</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 * ss }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ fontSize: 14 * fs, color: "#111827" }}>{exp.position}</strong>
                      {exp.company && <span style={{ fontSize: 13.5 * fs, color: "#4b5563" }}> | {exp.company}</span>}
                    </div>
                    <span style={{ fontSize: 12 * fs, color: "#6b7280" }}>
                      {exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : exp.current ? " – Present" : ""}
                    </span>
                  </div>
                  {exp.description && (
                    <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#4b5563", marginTop: 4, whiteSpace: "pre-line" }}>{exp.description}</p>
                  )}
                  {exp.highlights.filter(Boolean).length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18, listStyleType: "disc" }}>
                      {exp.highlights.filter(Boolean).map((h, i) => (
                        <li key={i} style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#4b5563", marginBottom: 2 }}>{h}</li>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * ss }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div>
                    <strong style={{ fontSize: 13.5 * fs, color: "#111827" }}>
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                    </strong>
                    {edu.institution && <span style={{ fontSize: 13 * fs, color: "#4b5563" }}> — {edu.institution}</span>}
                    {edu.gpa && <span style={{ fontSize: 12 * fs, color: "#6b7280" }}> | GPA: {edu.gpa}</span>}
                  </div>
                  <span style={{ fontSize: 12 * fs, color: "#6b7280" }}>
                    {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "skills":
        return skills.length > 0 ? (
          <div key={key}>
            <SectionTitle>Skills</SectionTitle>
            <p style={{ fontSize: 13 * fs, lineHeight: 1.8, color: "#374151" }}>
              {skills.map((s) => s.name).join(" • ")}
            </p>
          </div>
        ) : null;

      case "projects":
        return projects.length > 0 ? (
          <div key={key}>
            <SectionTitle>Projects</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 * ss }}>
              {projects.map((proj) => (
                <div key={proj.id}>
                  <strong style={{ fontSize: 13.5 * fs, color: "#111827" }}>{proj.name}</strong>
                  {proj.url && <span style={{ fontSize: 12 * fs, color: accent }}> | {proj.url}</span>}
                  {proj.description && <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#4b5563", marginTop: 3 }}>{proj.description}</p>}
                  {proj.technologies.length > 0 && (
                    <p style={{ fontSize: 11.5 * fs, color: "#6b7280", marginTop: 2 }}>Technologies: {proj.technologies.join(", ")}</p>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 6 * ss }}>
              {certifications.map((c) => (
                <div key={c.id} style={{ fontSize: 13 * fs, color: "#374151" }}>
                  <strong>{c.name}</strong>{c.issuer ? `, ${c.issuer}` : ""}{c.date ? ` (${c.date})` : ""}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case "languages":
        return languages.length > 0 ? (
          <div key={key}>
            <SectionTitle>Languages</SectionTitle>
            <p style={{ fontSize: 13 * fs, color: "#374151" }}>
              {languages.map((l) => `${l.name} (${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)})`).join(" • ")}
            </p>
          </div>
        ) : null;

      case "custom":
        return customSections.length > 0 ? (
          <div key={key}>
            {customSections.map((sec) => (
              <div key={sec.id}>
                <SectionTitle>{sec.title}</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 * ss }}>
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <strong style={{ fontSize: 13 * fs, color: "#111827" }}>{item.title}</strong>
                        {item.date && <span style={{ fontSize: 12 * fs, color: "#6b7280" }}>{item.date}</span>}
                      </div>
                      {item.subtitle && <p style={{ fontSize: 12.5 * fs, color: "#4b5563" }}>{item.subtitle}</p>}
                      {item.description && <p style={{ fontSize: 12.5 * fs, lineHeight: ls, color: "#4b5563", marginTop: 2 }}>{item.description}</p>}
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
    <div style={{ fontFamily: font, background: "white", color: "#111827", padding: "36px 44px", minHeight: "100%" }}>
      {vis.personal && (
        <div style={{ marginBottom: 16 * ss }}>
          <h1 style={{ fontSize: 26 * fs, fontWeight: 700, color: "#111827" }}>{p.fullName || "Your Name"}</h1>
          {p.jobTitle && <p style={{ fontSize: 14 * fs, color: accent, fontWeight: 500, marginTop: 2 }}>{p.jobTitle}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 8, fontSize: 12 * fs, color: "#6b7280" }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>{p.phone}</span>}
            {p.location && <span>{p.location}</span>}
            {p.website && <span>{p.website}</span>}
            {p.linkedin && <span>{p.linkedin}</span>}
          </div>
          <Hr />
        </div>
      )}
      {order.map(renderSection)}
    </div>
  );
}
