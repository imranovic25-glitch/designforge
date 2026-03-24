import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { SEOHead } from "@/src/components/seo/SEOHead";

export function HowToChooseAColorPalette() {
  return (
    <ArticleLayout
      title="How to Choose a Color Palette"
      description="A designer's guide to selecting effective colour palettes for websites, apps, branding, and UI projects — with theory, tools, and practical examples."
      category="Design"
      author="DesignForge360 Editorial"
      date="April 8, 2026"
      readTime="7 min read"
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How to Choose a Color Palette" },
      ]}
    >
      <SEOHead
        title="How to Choose a Color Palette — Design Guide (2026)"
        description="Learn how to build colour palettes for web design, branding, and UI. Covers colour theory, accessibility, tools, and real-world examples."
        canonical="/guides/how-to-choose-a-color-palette"
        schema="Article"
        ogType="article"
        articlePublishedTime="2026-04-08"
        articleSection="Guides"
      />

      <p>
        Colour sets the mood, guides attention, and shapes perception of your brand. A well-chosen palette can make a design feel professional and cohesive. A poorly chosen one creates confusion and distrust. Here's how to get it right.
      </p>

      <h2>Colour Theory Basics</h2>
      <ul>
        <li><strong>Complementary:</strong> Two colours opposite on the colour wheel (e.g., blue + orange). High contrast, high energy</li>
        <li><strong>Analogous:</strong> Three colours next to each other (e.g., blue, teal, green). Harmonious and calming</li>
        <li><strong>Triadic:</strong> Three colours equally spaced (e.g., red, yellow, blue). Vibrant but harder to balance</li>
        <li><strong>Monochromatic:</strong> Shades, tints, and tones of a single hue. Elegant and easy to manage</li>
        <li><strong>Split-complementary:</strong> One base colour + two adjacent to its complement. Balanced with visual interest</li>
      </ul>

      <h2>The 60-30-10 Rule</h2>
      <p>
        A reliable formula for balanced designs: 60% dominant colour (backgrounds, large surfaces), 30% secondary colour (cards, headers, sections), and 10% accent colour (buttons, links, calls to action). This creates visual hierarchy without overwhelming users.
      </p>

      <h2>Choosing Your Base Colour</h2>
      <p>
        Start with brand meaning. Blue conveys trust and professionalism — popular in finance and tech. Green signals growth, health, and sustainability. Red creates urgency and excitement. Black and white suggest luxury or minimalism. Let the brand's personality drive the anchor colour.
      </p>

      <h2>Building the Full Palette</h2>
      <ol>
        <li>Pick your primary brand colour</li>
        <li>Use our <a href="/tools/color-palette-generator">Color Palette Generator</a> to explore harmonies automatically</li>
        <li>Generate light and dark variations for backgrounds and text</li>
        <li>Add a neutral range (grays) for body text, borders, and backgrounds</li>
        <li>Choose one accent colour for interactive elements</li>
      </ol>

      <h2>Accessibility Matters</h2>
      <p>
        Approximately 8% of men and 0.5% of women have colour vision deficiency. Always check contrast ratios against WCAG 2.1 guidelines: 4.5:1 for normal text, 3:1 for large text. Never rely on colour alone to convey meaning — pair colour with icons, labels, or patterns.
      </p>

      <h2>Tools for Palette Creation</h2>
      <ul>
        <li><a href="/tools/color-palette-generator">DesignForge360 Color Palette Generator</a> — generate harmonies from any hex code</li>
        <li><strong>Coolors:</strong> Rapid palette generator with locking and exports</li>
        <li><strong>Adobe Color:</strong> Advanced colour wheel with accessibility checker</li>
        <li><strong>Realtime Colors:</strong> See palettes applied to a live website layout</li>
      </ul>

      <h2>Common Mistakes</h2>
      <ul>
        <li>Using too many colours — stick to 3–5 plus neutrals</li>
        <li>Ignoring dark mode — test palettes in both light and dark contexts</li>
        <li>Choosing colours in isolation — always preview in context (buttons, text on backgrounds, cards)</li>
        <li>Neglecting cultural meaning — colours carry different associations in different markets</li>
      </ul>

      <p className="text-white/40 text-sm italic">
        Try our free <a href="/tools/color-palette-generator">Color Palette Generator</a> to build your palette in seconds.
      </p>
    </ArticleLayout>
  );
}
