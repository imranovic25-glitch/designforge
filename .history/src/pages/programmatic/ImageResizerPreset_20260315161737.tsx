import { useParams, Link } from "react-router-dom";
import { ToolLayout } from "@/src/components/layout/ToolLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Maximize2, ArrowRight, Monitor, Smartphone, Image } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { findProgrammaticPage, getRelatedPages, imageResizerPages } from "@/src/lib/programmatic-seo";

export function ImageResizerPreset() {
  const { slug } = useParams<{ slug: string }>();
  const page = findProgrammaticPage(slug ?? "");

  if (!page || page.cluster !== "image-resizer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white/50">Page not found</p>
      </div>
    );
  }

  const related = getRelatedPages(page);
  const w = page.preset.width as number;
  const h = page.preset.height as number;
  const ratio = (w / h).toFixed(2);
  const megapixels = ((w * h) / 1_000_000).toFixed(2);

  return (
    <ToolLayout
      title={page.h1}
      description={page.description}
      icon={<Maximize2 className="h-7 w-7" />}
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
        appName="Image Resizer"
        faqItems={page.faq}
      />

      <div className="space-y-10">
        {/* Intro */}
        <div className="prose prose-invert max-w-none">
          <p className="text-white/70 text-base leading-relaxed">{page.intro}</p>
        </div>

        {/* Spec card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h2 className="text-white text-lg font-semibold">Dimensions at a Glance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white tabular-nums">{w}×{h}</div>
              <div className="text-xs text-white/40 mt-1">Pixels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white tabular-nums">{ratio}</div>
              <div className="text-xs text-white/40 mt-1">Aspect Ratio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white tabular-nums">{megapixels}</div>
              <div className="text-xs text-white/40 mt-1">Megapixels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">JPG / PNG / WebP</div>
              <div className="text-xs text-white/40 mt-1">Output Formats</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          <Link to="/tools/image-resizer">
            <Button className="rounded-full px-10 h-14 text-base gap-3 font-semibold">
              <Maximize2 className="h-5 w-5" />
              Open Image Resizer — Preset {w}×{h}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-white/30 text-sm">Free, no sign-up, works entirely in your browser</p>
        </div>

        {/* How it works */}
        <div className="space-y-4">
          <h2 className="text-white text-lg font-semibold">How to Resize to {w}×{h}</h2>
          <ol className="space-y-3 text-white/60 text-sm list-decimal list-inside">
            <li>Click <strong className="text-white/80">"Open Image Resizer"</strong> above</li>
            <li>Upload your image (drag & drop or click to browse)</li>
            <li>Set width to <strong className="text-white/80">{w}</strong> and height to <strong className="text-white/80">{h}</strong></li>
            <li>Choose your output format (JPG, PNG, or WebP)</li>
            <li>Click <strong className="text-white/80">Resize</strong> and download instantly</li>
          </ol>
        </div>

        {/* Related presets */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Related Image Sizes</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/tools/${r.slug}`}
                  className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <Image className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{r.h1}</span>
                  <ArrowRight className="h-3 w-3 ml-auto text-white/20 group-hover:text-white/50 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Browse all */}
        <div className="text-center pt-4">
          <Link to="/tools/image-resizer" className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">
            Browse all image resize presets →
          </Link>
        </div>
      </div>
    </ToolLayout>
  );
}
