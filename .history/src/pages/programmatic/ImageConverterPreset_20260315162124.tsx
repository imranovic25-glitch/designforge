import { Link, useLocation } from "react-router-dom";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { ArrowRightLeft, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { findProgrammaticPage, getRelatedPages } from "@/src/lib/programmatic-seo";

const FORMAT_INFO: Record<string, { label: string; description: string }> = {
  jpeg: { label: "JPG", description: "Lossy, small file size, best for photos. No transparency." },
  png:  { label: "PNG", description: "Lossless, supports transparency. Larger file size." },
  webp: { label: "WebP", description: "Modern format, smallest size + transparency. 97%+ browser support." },
  bmp:  { label: "BMP", description: "Uncompressed, maximum compatibility. Very large files." },
};

export function ImageConverterPreset() {
  const { pathname } = useLocation();
  const slug = pathname.split("/").pop() ?? "";
  const page = findProgrammaticPage(slug);

  if (!page || page.cluster !== "image-converter") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Page not found</p>
      </div>
    );
  }

  const related = getRelatedPages(page);
  const targetFormat = page.preset.format as string;
  const quality = page.preset.quality as number | undefined;
  const targetInfo = FORMAT_INFO[targetFormat] ?? FORMAT_INFO.jpeg;

  // Derive source format from slug (e.g., "convert-png-to-jpg" → "PNG")
  const match = page.slug.match(/^convert-(\w+)-to-(\w+)$/);
  const sourceLabel = match ? match[1].toUpperCase() : "Image";
  const targetLabel = match ? match[2].toUpperCase() : targetInfo.label;

  return (
    <ToolLayout
      title={page.h1}
      description={page.description}
      icon={<ArrowRightLeft className="h-7 w-7" />}
      toolSlug={page.slug}
      faqItems={page.faq}
      relatedGuides={[{ title: "How to Remove Image Backgrounds", path: "/guides/how-to-remove-image-background" }]}
      relatedComparisons={[{ title: "Best Image Resizer Tools", path: "/comparisons/best-image-resizer-tools" }]}
    >
      <SEOHead
        title={page.title}
        description={page.description}
        canonical={`/tools/${page.slug}`}
        schema="WebApplication"
        appName="Image Converter"
        faqItems={page.faq}
      />

      <div className="space-y-10">
        {/* Intro */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 text-base leading-relaxed">{page.intro}</p>
        </div>

        {/* Conversion visual */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">{sourceLabel}</span>
              </div>
              <span className="text-white/40 text-xs">Source</span>
            </div>
            <ArrowRight className="h-6 w-6 text-white/30" />
            <div className="text-center">
              <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">{targetLabel}</span>
              </div>
              <span className="text-white/40 text-xs">Output</span>
            </div>
          </div>
          <p className="text-center text-white/50 text-sm mt-4">{targetInfo.description}</p>
          {quality && (
            <p className="text-center text-white/30 text-xs mt-1">Recommended quality: {quality}%</p>
          )}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <Link to="/tools/image-converter">
            <Button className="rounded-full px-10 h-14 text-base gap-3 font-semibold">
              <ArrowRightLeft className="h-5 w-5" />
              Open Image Converter
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm">Free, no sign-up, works entirely in your browser</p>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">How to Convert {sourceLabel} to {targetLabel}</h2>
          <ol className="space-y-3 text-white/60 text-sm list-decimal list-inside">
            <li>Click <strong className="text-white/80">"Open Image Converter"</strong> above</li>
            <li>Upload your {sourceLabel} file (drag & drop or click to browse)</li>
            <li>Select <strong className="text-white/80">{targetInfo.label}</strong> as output format</li>
            {quality && <li>Adjust quality to <strong className="text-white/80">{quality}%</strong> (recommended)</li>}
            <li>Click <strong className="text-white/80">Convert</strong> and download your {targetLabel} file</li>
          </ol>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Other Conversions</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/tools/${r.slug}`}
                  className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <ArrowRightLeft className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.h1}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link to="/tools/image-converter" className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">
            Open full Image Converter →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
