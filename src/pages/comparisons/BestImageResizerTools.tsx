import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";

const tools = [
  {
    name: "Adobe Express",
    tagline: "Best for Designers in the Adobe Ecosystem",
    pricing: "Free tier; Premium at $9.99/month",
    logo: "https://logo.clearbit.com/adobe.com",
    url: "https://www.adobe.com/express/feature/image/resize",
    pros: [
      "Resize images with preset social media dimensions",
      "Integration with Adobe Photoshop and Illustrator",
      "Drag-and-drop canvas editor with templates",
      "AI background removal included",
      "Cloud storage and brand kit features"
    ]
  },
  {
    name: "Canva",
    tagline: "Best for Non-Designers Needing Quick Resizes",
    pricing: "Free tier; Pro at $15/month",
    logo: "https://logo.clearbit.com/canva.com",
    url: "https://www.canva.com/features/image-resizer/",
    pros: [
      "Magic Resize resizes your design instantly to multiple formats",
      "100+ preset dimensions for social, print, and ads",
      "Drag-and-drop interface with thousands of templates",
      "Background remover and photo editor included",
      "Real-time collaboration for teams"
    ]
  },
  {
    name: "Squoosh",
    tagline: "Best Free Browser-Based Image Optimizer",
    pricing: "Completely free and open source",
    logo: "https://logo.clearbit.com/squoosh.app",
    url: "https://squoosh.app/",
    pros: [
      "Resize and compress with real-time preview",
      "Supports WebP, AVIF, JPEG, PNG, and more",
      "Side-by-side quality comparison slider",
      "Runs entirely in your browser — no upload to servers",
      "Open source and built by Google Chrome team"
    ]
  },
  {
    name: "ILoveIMG",
    tagline: "Best for Batch Image Resizing",
    pricing: "Free; Premium at $6/month",
    logo: "https://logo.clearbit.com/iloveimg.com",
    url: "https://www.iloveimg.com/resize-image",
    pros: [
      "Batch resize hundreds of images at once",
      "Resize by dimensions, percentage, or file size",
      "JPEG, PNG, GIF, WebP support",
      "No watermarks on free tier",
      "API available for developers"
    ]
  },
  {
    name: "ResizePixel",
    tagline: "Best for Simple One-Click Resizing",
    pricing: "Free; Pro at $4.99/month",
    logo: "https://logo.clearbit.com/resizepixel.com",
    url: "https://www.resizepixel.com/",
    pros: [
      "Resize, crop, and convert with a simple UI",
      "Supports JPEG, PNG, GIF, BMP, TIFF, WebP",
      "No software installation required",
      "Image conversion included for free",
      "Privacy-focused: files deleted after one hour"
    ]
  },
  {
    name: "Fotor",
    tagline: "Best for Creative Photo Editing and Resizing",
    pricing: "Free; Pro at $8.99/month",
    logo: "https://logo.clearbit.com/fotor.com",
    url: "https://www.fotor.com/features/photo-resizer/",
    pros: [
      "Intuitive drag-and-drop image resizer",
      "Photo enhancer and AI tools alongside resize",
      "Social media preset dimensions built in",
      "Supports JPEG, PNG, and HEIC",
      "Desktop app available for Windows and Mac"
    ]
  },
  {
    name: "BulkResizePhotos",
    tagline: "Best for High-Volume Batch Processing",
    pricing: "Completely free",
    logo: "https://logo.clearbit.com/bulkresizephotos.com",
    url: "https://bulkresizephotos.com/",
    pros: [
      "Resize up to hundreds of images simultaneously in browser",
      "Set max width, height, percentage, or file size",
      "Client-side processing — images never leave your device",
      "No registration or upload required",
      "Lightning fast for large batches"
    ]
  },
  {
    name: "Kraken.io",
    tagline: "Best for Web Performance Optimisation",
    pricing: "Free up to 100MB; Pro from $5/month",
    logo: "https://logo.clearbit.com/kraken.io",
    url: "https://kraken.io/",
    pros: [
      "Lossless and lossy compression with resize",
      "API for automated image processing pipelines",
      "WordPress plugin available",
      "Intelligent compression preserving image quality",
      "Bulk processing for web teams and developers"
    ]
  },
  {
    name: "PicResize",
    tagline: "Best for Fast No-Frills Online Resizing",
    pricing: "Free",
    logo: "https://logo.clearbit.com/picresize.com",
    url: "https://picresize.com/",
    pros: [
      "Resize from device, URL, or Dropbox",
      "Crop, rotate, and add effects alongside resize",
      "Supports JPEG, PNG, GIF, BMP, TIFF",
      "No signup required",
      "Clean and minimal interface"
    ]
  },
  {
    name: "BIRME",
    tagline: "Best for Custom Aspect Ratio Resizing",
    pricing: "Free",
    logo: "https://logo.clearbit.com/birme.net",
    url: "https://www.birme.net/",
    pros: [
      "Bulk image resizing with aspect ratio lock",
      "Auto-crop feature for precise square thumbnails",
      "Drag and drop multiple images at once",
      "Custom output dimensions and format",
      "Runs in-browser — no server upload needed"
    ]
  }
];

export function BestImageResizerTools() {
  return (
    <ArticleLayout
      title="Best Image Resizer Tools of 2026"
      description="The top online and desktop tools for resizing, compressing, and converting images — tested and ranked by ease of use and output quality."
      category="Comparisons"
      categoryLink="/comparisons"
      author="DesignForge360 Editorial"
      date="April 1, 2026"
      readTime="10 min read"
    >
      <SEOHead
        title="Best Image Resizer Tools of 2026 — 10 Options Compared"
        description="Compare the top image resizing tools from free browser apps to professional software. Adobe Express, Canva, Squoosh, Kraken.io, and more reviewed."
        canonical="/comparisons/best-image-resizer-tools"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-01-15"
        articleSection="Comparisons"
      />
      <p>
        Whether you're preparing social media assets, optimising images for your website, or processing product photos in bulk, the right image resizer can save hours every week. We tested the top tools for speed, output quality, batch support, and ease of use — here are our top 10 picks.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {tools.map((tool, index) => (
          <ComparisonCard
            key={tool.name}
            index={index}
            brandName={tool.name}
            logoUrl={tool.logo}
            title={tool.name}
            tagline={tool.tagline}
            accent="amber"
            pros={tool.pros}
            meta={[{ label: "Pricing", value: tool.pricing }]}
            primaryAction={{ label: "Try It", href: tool.url }}
            secondaryAction={{ label: "Learn More", href: tool.url }}
          />
        ))}
      </div>

      <h2>What to Look For</h2>
      <p>
        For casual use, a free browser-based tool like Squoosh or ILoveIMG is more than enough. For creative work, Adobe Express or Canva give you an integrated design workflow. If you're a developer or managing hundreds of images regularly, look for a tool with an API or batch processing — Kraken.io and BulkResizePhotos both deliver here.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
