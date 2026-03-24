import { useParams, Link } from "react-router-dom";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { FileText, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { findProgrammaticPage, getRelatedPages } from "@/src/lib/programmatic-seo";

export function PdfCompressorPreset() {
  const { slug } = useParams<{ slug: string }>();
  const page = findProgrammaticPage(slug ?? "");

  if (!page || page.cluster !== "pdf-compressor") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Page not found</p>
      </div>
    );
  }

  const related = getRelatedPages(page);
  const level = page.preset.compressionLevel as string;

  return (
    <ToolLayout
      title={page.h1}
      description={page.description}
      icon={<FileText className="h-7 w-7" />}
      toolSlug={page.slug}
      faqItems={page.faq}
      relatedGuides={[{ title: "How to Compress PDF Files", path: "/guides/how-to-compress-pdf" }]}
      relatedComparisons={[{ title: "Best PDF Editors", path: "/comparisons/best-pdf-editors" }]}
    >
      <SEOHead
        title={page.title}
        description={page.description}
        canonical={`/tools/${page.slug}`}
        schema="WebApplication"
        appName="PDF Compressor"
        faqItems={page.faq}
      />

      <div className="space-y-10">
        {/* Intro */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 text-base leading-relaxed">{page.intro}</p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: <Shield className="h-5 w-5" />, label: "100% Private", desc: "Your PDF never leaves your device. All processing happens in-browser." },
            { icon: <Zap className="h-5 w-5" />, label: "Instant Processing", desc: "Browser-based compression — no upload wait, no download wait." },
            { icon: <FileText className="h-5 w-5" />, label: `${level.charAt(0).toUpperCase() + level.slice(1)} Compression`, desc: "Optimized balance of file size reduction and quality preservation." },
          ].map((f, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 text-center space-y-2">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 mx-auto">{f.icon}</div>
              <p className="text-white font-medium text-sm">{f.label}</p>
              <p className="text-white/40 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <Link to="/tools/pdf-compressor">
            <Button className="rounded-full px-10 h-14 text-base gap-3 font-semibold">
              <FileText className="h-5 w-5" />
              Open PDF Compressor
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm">Free, no sign-up, works entirely in your browser</p>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">How to Compress Your PDF</h2>
          <ol className="space-y-3 text-white/60 text-sm list-decimal list-inside">
            <li>Click <strong className="text-white/80">"Open PDF Compressor"</strong> above</li>
            <li>Upload your PDF file (drag & drop or click to browse)</li>
            <li>Select <strong className="text-white/80">{level.charAt(0).toUpperCase() + level.slice(1)}</strong> compression level</li>
            <li>Click <strong className="text-white/80">Compress</strong> and download the smaller file</li>
          </ol>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Related PDF Tools</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/tools/${r.slug}`}
                  className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <FileText className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.h1}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/tools/pdf-compressor" className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">
            Open full PDF Compressor →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
