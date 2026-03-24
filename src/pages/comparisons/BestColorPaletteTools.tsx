import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { ComparisonCard } from "@/src/components/ui/ComparisonCard";

const tools = [
  {
    name: "Coolors",
    tagline: "Best Fast Palette Generator",
    pricing: "Free; Pro at $2.99/month",
    logo: "https://logo.clearbit.com/coolors.co",
    url: "https://coolors.co/",
    pros: [
      "Generate palettes instantly with spacebar — insanely fast workflow",
      "Lock individual colours and regenerate the rest",
      "Export to PNG, PDF, SVG, and code formats (HEX, RGB, HSL)",
      "Colour blindness simulator built in",
      "iOS app, Figma plugin, and Chrome extension",
    ],
  },
  {
    name: "Adobe Color",
    tagline: "Best Advanced Colour Wheel",
    pricing: "Free (account required)",
    logo: "https://logo.clearbit.com/adobe.com",
    url: "https://color.adobe.com/",
    pros: [
      "Professional colour wheel with harmony rules",
      "Extract palettes from uploaded images",
      "Accessibility contrast checker built in",
      "Save palettes directly to Adobe Creative Cloud Libraries",
      "Explore trending palettes from the community",
    ],
  },
  {
    name: "Realtime Colors",
    tagline: "Best for Previewing Palettes on Websites",
    pricing: "Free",
    logo: "https://logo.clearbit.com/realtimecolors.com",
    url: "https://www.realtimecolors.com/",
    pros: [
      "See your palette applied to a live website layout instantly",
      "Adjust primary, secondary, text, and background colours in real time",
      "Export to CSS, Tailwind, and design token formats",
      "Dark/light mode toggle to test both themes",
      "Font pairing suggestions alongside colour",
    ],
  },
  {
    name: "Color Hunt",
    tagline: "Best Curated Palette Library",
    pricing: "Free",
    logo: "https://logo.clearbit.com/colorhunt.co",
    url: "https://colorhunt.co/",
    pros: [
      "Thousands of hand-picked, community-curated palettes",
      "Browse by category: pastel, vintage, neon, earth, gradient",
      "One-click copy for any colour in a palette",
      "New palettes added daily",
      "Chrome extension for quick access",
    ],
  },
  {
    name: "Khroma",
    tagline: "Best AI-Powered Colour Tool",
    pricing: "Free",
    logo: "https://logo.clearbit.com/khroma.co",
    url: "https://www.khroma.co/",
    pros: [
      "AI learns your colour preferences from 50 initial picks",
      "Generates infinite personalised palettes",
      "View combinations as typography, gradients, or poster mockups",
      "Save favourites to a personal collection",
      "Unique approach to palette discovery",
    ],
  },
  {
    name: "Paletton",
    tagline: "Best Colour Theory Learning Tool",
    pricing: "Free",
    logo: "https://logo.clearbit.com/paletton.com",
    url: "https://paletton.com/",
    pros: [
      "Interactive colour wheel with clear theory visualisation",
      "Adjacent, triad, tetrad, and free-form harmony modes",
      "Live preview of palette applied to sample website layout",
      "Fine-tune hue, saturation, and brightness per swatch",
      "Educational — great for learning colour relationships",
    ],
  },
  {
    name: "DesignForge360 Color Palette Generator",
    tagline: "Best Free Browser-Based Generator",
    pricing: "Free — no signup required",
    logo: "",
    url: "/tools/color-palette-generator",
    pros: [
      "Generate harmonies from any hex code instantly",
      "Supports complementary, analogous, triadic, and monochromatic schemes",
      "Copy individual colours or full palettes",
      "100% browser-based — no data uploaded",
      "Clean, fast, and mobile-friendly",
    ],
  },
];

export function BestColorPaletteTools() {
  return (
    <ArticleLayout
      title="Best Color Palette Tools of 2026"
      description="Compare the top colour palette generators and tools for designers — from rapid generators to AI-powered discovery and curated libraries."
      category="Comparisons"
      categoryLink="/comparisons"
      author="DesignForge360 Editorial"
      date="April 8, 2026"
      readTime="9 min read"
    >
      <SEOHead
        title="Best Color Palette Tools of 2026 — 7 Options Compared"
        description="Compare the best colour palette generators for web design and branding. Coolors, Adobe Color, Realtime Colors, Color Hunt, and more reviewed."
        canonical="/comparisons/best-color-palette-tools"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-01-15"
        articleSection="Comparisons"
      />

      <p>
        The right colour palette tool accelerates design decisions and ensures visual consistency. Whether you need rapid generation, AI suggestions, or curated inspiration, we've compared the best options for designers in 2026.
      </p>

      <h2>Our Top 7 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {tools.map((tool, index) => (
          <ComparisonCard
            key={tool.name}
            index={index}
            brandName={tool.name}
            logoUrl={tool.logo}
            title={tool.name}
            tagline={tool.tagline}
            accent="violet"
            pros={tool.pros}
            meta={[{ label: "Pricing", value: tool.pricing }]}
            primaryAction={{ label: "Try It", href: tool.url }}
            secondaryAction={{ label: "Learn More", href: tool.url }}
          />
        ))}
      </div>

      <h2>Which Tool Should You Use?</h2>
      <p>
        For speed, Coolors is unmatched — press spacebar and get a palette in a second. For theory and education, Paletton visualises colour relationships beautifully. Adobe Color is the natural choice if you're already in the Adobe ecosystem. For seeing palettes in context, Realtime Colors is the best preview tool available.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
