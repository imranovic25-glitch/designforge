import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const tools = [
  {
    name: "Jasper",
    tagline: "Best for Long-Form Marketing Content",
    pricing: "From $49/month (Creator); Business plans available",
    pros: [
      "Long-form document editor with campaign workflows",
      "Brand voice training on your own content and style guides",
      "50+ content templates (ads, emails, blog posts, social)",
      "SEO mode with Surfer SEO integration",
      "Team collaboration with shared brand assets"
    ]
  },
  {
    name: "Grammarly",
    tagline: "Best for Everyday Writing Improvement",
    pricing: "Free tier; Premium at $12/month; Business at $15/member/month",
    pros: [
      "Browser extension works across Gmail, Docs, LinkedIn, and more",
      "Tone detection and adjustment (professional, friendly, confident)",
      "Grammar, clarity, engagement, and delivery suggestions",
      "Generative AI assistant for drafting and rewriting",
      "Plagiarism detection on Premium and Business plans"
    ]
  },
  {
    name: "ChatGPT (OpenAI)",
    tagline: "Best for Conversational AI Drafting",
    pricing: "Free tier; Plus at $20/month; Team at $25/user/month",
    pros: [
      "Conversational interface for iterative content refinement",
      "Handles diverse content types — blog posts to code to poetry",
      "Web browsing and file upload for research-backed writing",
      "Custom GPTs for specialized writing workflows",
      "Strong reasoning for technical and analytical content"
    ]
  },
  {
    name: "Copy.ai",
    tagline: "Best for Sales and Marketing Copy",
    pricing: "Free tier (2,000 words/month); Pro at $49/month",
    pros: [
      "Purpose-built for marketing copy — ads, product descriptions, emails",
      "90+ copywriting templates and frameworks",
      "Workflow automation for content pipelines",
      "Brand voice and tone customization",
      "Bulk content generation for product catalogs"
    ]
  },
  {
    name: "Writesonic",
    tagline: "Best for SEO-Optimized Blog Content",
    pricing: "Free trial; Pro from $19/month",
    pros: [
      "AI Article Writer generates full SEO-optimized blog posts",
      "Real-time Google search integration for factual content",
      "Chatsonic — AI chat with current web knowledge",
      "Built-in image generation with Photosonic",
      "WordPress integration for direct publishing"
    ]
  }
];

export function BestAiWritingTools() {
  return (
    <ArticleLayout
      title="Best AI Writing Tools of 2026"
      description="An editorial review of the top AI writing assistants for content creators, marketers, and professionals."
      category="Productivity"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="9 min read"
      breadcrumbs={[
        { label: "Comparisons", href: "/comparisons" },
        { label: "Best AI Writing Tools" }
      ]}
    >
      <p>
        AI writing tools have moved far beyond simple grammar checkers. The best ones can draft blog posts, emails, ad copy, and long-form content — with enough quality that they genuinely accelerate your work rather than just creating more editing. Here's our breakdown of the top five.
      </p>

      <h2>Our Top Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {tools.map((tool) => (
          <div key={tool.name} className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">{tool.name}</h3>
                <p className="text-white/50 font-light">{tool.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{tool.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {tool.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full px-8 h-11">Try It <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
              <Button variant="outline" className="rounded-full px-8 h-11 border-white/20 text-white hover:bg-white/10">Learn More</Button>
            </div>
          </div>
        ))}
      </div>

      <h2>What to Consider</h2>
      <p>
        Think about how you'll primarily use the tool — for drafting from scratch, polishing existing writing, or specific formats like emails or social copy. Also consider output quality for your specific industry, pricing relative to how often you'll use it, and privacy policy if you're inputting sensitive information.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
