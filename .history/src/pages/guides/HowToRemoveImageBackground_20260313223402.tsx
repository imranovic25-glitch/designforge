import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Sparkles } from "lucide-react";

export function HowToRemoveImageBackground() {
  return (
    <ArticleLayout
      title="How to Remove Image Backgrounds"
      description="A complete guide to removing backgrounds from photos using AI tools, manual techniques, and professional software."
      category="Design"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="8 min read"
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How to Remove Image Backgrounds" }
      ]}
    >
      <SEOHead
        title="How to Remove an Image Background Online — Free Step-by-Step Guide"
        description="Step-by-step guide to removing image backgrounds using AI tools and manual techniques. Free browser tools included."
        canonical="/guides/how-to-remove-image-background"
        schema="HowTo"
        ogType="article"
        articlePublishedTime="2026-01-01"
        articleSection="Guides"
      />
      <p>
        Background removal is one of the most commonly needed photo editing tasks — for product photos, profile pictures, marketing materials, and design assets. The good news is that AI tools have made this dramatically easier. Here's everything you need to know.
      </p>

      <div className="not-prose my-10">
        <div className="glass-panel rounded-2xl p-6 flex gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-white font-medium mb-1">Try our free tool</p>
            <p className="text-white/50 text-sm font-light">
              You can remove backgrounds instantly using our <a href="/tools/background-remover" className="text-white underline underline-offset-4">Background Remover tool</a>. It processes everything in your browser — no uploads, no registration.
            </p>
          </div>
        </div>
      </div>

      <h2>Method 1: Using an AI Tool (Fastest)</h2>
      <p>
        AI-powered tools are the fastest path to clean background removal. They use neural networks trained on millions of images to automatically detect foreground subjects.
      </p>
      <h3>Step 1: Choose Your Tool</h3>
      <p>
        Select an AI tool that suits your workflow. Our Background Remover tool works entirely in your browser. Alternatively, tools like Remove.bg, Canva, or Adobe Express offer AI removal with additional editing features.
      </p>
      <h3>Step 2: Upload Your Image</h3>
      <p>
        Drag your image into the tool or click to upload. Most tools accept JPG, PNG, and WebP. For best results, use a high-resolution image with clear contrast between the subject and background.
      </p>
      <h3>Step 3: Download the Result</h3>
      <p>
        Download the transparent PNG. If the edges look rough or the AI missed parts of the subject, use the tool's manual refinement brush to correct.
      </p>

      <h2>Method 2: Manual Removal in Photoshop</h2>
      <p>
        For complex images where AI struggles — like transparent objects, similar-color subjects and backgrounds, or detailed textures — manual Photoshop methods give you full control.
      </p>
      <ul>
        <li>Use the <strong>Select Subject</strong> tool (AI-powered selection) as a starting point</li>
        <li>Refine with <strong>Select and Mask</strong>, using the Refine Edge brush on hair or fur</li>
        <li>Use the Pen Tool for precise paths on hard-edged objects like products</li>
        <li>Add a <strong>Layer Mask</strong> to non-destructively hide the background</li>
      </ul>

      <h2>Tips for Best Results</h2>
      <ul>
        <li><strong>Shoot with contrast:</strong> A light subject on a dark background (or vice versa) gives AI tools more to work with.</li>
        <li><strong>Use high resolution:</strong> More pixels mean cleaner edges. Downscale after removal, not before.</li>
        <li><strong>Check edges at 100%:</strong> Zoom in to inspect and clean up any fringing or halo artifacts.</li>
        <li><strong>Use PNG for output:</strong> PNG supports transparency. Saving as JPG will add a white background.</li>
        <li><strong>Decontaminate colors:</strong> In Photoshop's Select and Mask, enable color decontamination to remove background color fringing from semi-transparent edges.</li>
      </ul>
    </ArticleLayout>
  );
}
