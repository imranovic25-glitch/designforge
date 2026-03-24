/* ═══════════════════════════════════════════════════════════════════════
 * Resume Builder — Premium 3-panel layout
 * Left:   Section nav (DnD reorder + visibility toggles)
 * Centre: Section editor
 * Right:  Live A4 preview + toolbar (template, style, PDF download)
 * ═══════════════════════════════════════════════════════════════════════ */

import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { ResumeProvider, useResume } from "@/src/lib/resume-store";
import { FONT_STACKS } from "@/src/lib/resume-types";
import { getTemplateComponent } from "@/src/components/resume/templates";
import { SectionNav } from "@/src/components/resume/SectionNav";
import { SectionEditor } from "@/src/components/resume/SectionEditor";
import { ResumePreview } from "@/src/components/resume/ResumePreview";
import { TemplateSelector } from "@/src/components/resume/TemplateSelector";
import { StyleSettings } from "@/src/components/resume/StyleSettings";
import {
  Download, Settings2, LayoutTemplate, ChevronLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/src/components/seo/SEOHead";

/* ── Left-panel tab routing ──────────────────────────────────────────── */
type LeftTab = "sections" | "templates" | "style";

function LeftPanel() {
  const [tab, setTab] = useState<LeftTab>("sections");

  const tabs: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
    { id: "sections", label: "Sections", icon: null },
    { id: "templates", label: "Templates", icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
    { id: "style", label: "Style", icon: <Settings2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <aside className="w-[260px] shrink-0 bg-white/[0.02] border-r border-white/[0.06] flex flex-col h-full">
      {/* Logo / back */}
      <div className="px-4 pt-5 pb-3">
        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/30 hover:text-white/60 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Tools
        </Link>
        <h1 className="text-lg font-bold text-white mt-2 tracking-tight">
          Resume Builder
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex px-3 gap-1 mb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
              tab === t.id
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/50 hover:bg-white/[0.04]"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab body */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {tab === "sections" && <SectionNav />}
        {tab === "templates" && <div className="px-2"><TemplateSelector /></div>}
        {tab === "style" && <div className="px-2"><StyleSettings /></div>}
      </div>
    </aside>
  );
}

/* ── Toolbar above preview ───────────────────────────────────────────── */
function PreviewToolbar() {
  const { resume } = useResume();

  const handleExportPdf = useCallback(() => {
    const Template = getTemplateComponent(resume.templateId);
    const font = FONT_STACKS[resume.style.fontFamily];
    const fontName = resume.style.fontFamily;

    // Google Fonts link for the chosen family
    const GFONT: Record<string, string> = {
      inter: "Inter:wght@300;400;500;600;700;800",
      georgia: "",
      merriweather: "Merriweather:wght@300;400;700;900",
      roboto: "Roboto:wght@300;400;500;700",
      playfair: "Playfair+Display:wght@400;500;600;700;800",
    };
    const gfLink = GFONT[fontName]
      ? `<link href="https://fonts.googleapis.com/css2?family=${GFONT[fontName]}&display=swap" rel="stylesheet">`
      : "";

    // We render the template into a hidden container, capture its HTML, and open a print window.
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.width = "794px";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<Template data={resume} />);

    // Give it a frame to paint, then print
    requestAnimationFrame(() => {
      const html = container.innerHTML;
      root.unmount();
      document.body.removeChild(container);

      const win = window.open("", "_blank");
      if (!win) return;

      const title = resume.personal.fullName || "Resume";
      win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>${title.replace(/</g, "&lt;")}</title>
${gfLink}
<style>
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; min-height: 297mm; font-family: ${font}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head><body>${html}</body></html>`);
      win.document.close();
      setTimeout(() => win.print(), 500);
    });
  }, [resume]);

  return (
    <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-white/[0.06] bg-white/[0.02]">
      <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest">
        Live Preview
      </span>
      <button
        onClick={handleExportPdf}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-teal-500/90 hover:bg-teal-400 text-[12px] font-semibold text-white transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Download PDF
      </button>
    </div>
  );
}

/* ── Inner layout (needs ResumeProvider context) ─────────────────────── */
function ResumeBuilderInner() {
  return (
    <div className="fixed inset-0 flex bg-[#0b0f1a]">
      {/* Left — Section Nav / Templates / Style */}
      <LeftPanel />

      {/* Centre — Section Editor */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <SectionEditor />
        </div>
      </main>

      {/* Right — Live Preview */}
      <div className="w-[46%] shrink-0 flex flex-col border-l border-white/[0.06] bg-[#0d1117]">
        <PreviewToolbar />
        <div className="flex-1 overflow-hidden">
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}

/* ── Exported page component ─────────────────────────────────────────── */
export function ResumeBuilder() {
  return (
    <ResumeProvider>
      <SEOHead
        title="Free Resume Builder — Create Professional Resumes Online"
        description="Build a professional resume in minutes with our free online resume builder. Multiple templates, instant PDF export."
        canonical="/tools/resume-builder"
        schema="WebApplication"
        appName="Resume Builder"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tools", url: "/tools" },
          { name: "Resume Builder", url: "/tools/resume-builder" },
        ]}
      />
      <ResumeBuilderInner />
    </ResumeProvider>
  );
}
