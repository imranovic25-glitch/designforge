import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const tools = [
  {
    name: "Jasper",
    tagline: "Best for Long-Form Marketing Content",
    pricing: "From $49/month (Creator); Business plans available",
    logo: "https://logo.clearbit.com/jasper.ai",
    url: "https://www.jasper.ai/",
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
    logo: "https://logo.clearbit.com/grammarly.com",
    url: "https://www.grammarly.com/",
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
    logo: "https://logo.clearbit.com/openai.com",
    url: "https://chat.openai.com/",
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
    logo: "https://logo.clearbit.com/copy.ai",
    url: "https://www.copy.ai/",
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
    logo: "https://logo.clearbit.com/writesonic.com",
    url: "https://writesonic.com/",
    pros: [
      "AI Article Writer generates full SEO-optimized blog posts",
      "Real-time Google search integration for factual content",
      "Chatsonic — AI chat with current web knowledge",
      "Built-in image generation with Photosonic",
      "WordPress integration for direct publishing"
    ]
  },
  {
    name: "Notion AI",
    tagline: "Best for Writing Within a Workspace",
    pricing: "Included with Notion Plus ($10/month); AI add-on $8/member/month",
    logo: "https://logo.clearbit.com/notion.so",
    url: "https://www.notion.so/product/ai",
    pros: [
      "AI built directly into your Notion workspace",
      "Summarize, translate, and improve existing notes",
      "Generate content within docs, wikis, and project pages",
      "Q&A across your entire workspace",
      "Seamless integration with Notion databases and templates"
    ]
  },
  {
    name: "Rytr",
    tagline: "Best Budget-Friendly AI Writer",
    pricing: "Free tier (10K chars/month); Premium at $9/month",
    logo: "https://logo.clearbit.com/rytr.me",
    url: "https://rytr.me/",
    pros: [
      "40+ content templates and use cases",
      "Supports 30+ languages",
      "Built-in plagiarism checker",
      "Tone and style customization",
      "Extremely affordable for individual creators"
    ]
  },
  {
    name: "Wordtune",
    tagline: "Best for Sentence-Level Rewriting",
    pricing: "Free tier; Premium at $9.99/month",
    logo: "https://logo.clearbit.com/wordtune.com",
    url: "https://www.wordtune.com/",
    pros: [
      "Rewrites entire sentences with multiple alternatives",
      "Shorten or expand text with one click",
      "Tone adjustments from casual to formal",
      "Browser extension for use across the web",
      "Wordtune Read summarizes long articles and PDFs"
    ]
  },
  {
    name: "Anyword",
    tagline: "Best for Performance-Driven Marketing Copy",
    pricing: "From $49/month (Starter); Business plans available",
    logo: "https://logo.clearbit.com/anyword.com",
    url: "https://anyword.com/",
    pros: [
      "Predictive Performance Score rates copy before publishing",
      "A/B testing insights built into the editor",
      "Brand voice and audience targeting",
      "Integrates with HubSpot, Notion, and social platforms",
      "Blog post wizard with SEO optimization"
    ]
  },
  {
    name: "Claude (Anthropic)",
    tagline: "Best for Thoughtful Long-Form Writing",
    pricing: "Free tier; Pro at $20/month; Team at $25/user/month",
    logo: "https://logo.clearbit.com/anthropic.com",
    url: "https://claude.ai/",
    pros: [
      "Excellent at nuanced, thoughtful long-form content",
      "200K token context window for working with long documents",
      "Strong at following detailed style and formatting instructions",
      "Artifacts feature for inline document editing",
      "File upload support for research and summarization"
    ]
  }
];

export function BestAiWritingTools() {
  return (
    <ArticleLayout
      title="Best AI Writing Tools of 2026"
      description="An editorial review of the top AI writing assistants for content creators, marketers, and professionals."
      category="Comparisons"
      categoryLink="/comparisons"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="12 min read"
    >
      <p>
        AI writing tools have moved far beyond simple grammar checkers. The best ones can draft blog posts, emails, ad copy, and long-form content — with enough quality that they genuinely accelerate your work rather than just creating more editing. Here's our breakdown of the top 10.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {tools.map((tool, index) => (
          <div key={tool.name} className="glass-panel rounded-3xl p-8 md:p-10 border border-violet-500/10 hover:border-violet-500/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold text-white">{index + 1}</div>
                  <img src={tool.logo} alt={tool.name + " logo"} className="w-14 h-14 rounded-xl bg-white p-1.5 object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{tool.name}</h3>
                  <p className="text-white/50 font-light">{tool.tagline}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{tool.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {tool.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-8 h-11 bg-violet-600 hover:bg-violet-500 text-white">
                <a href={tool.url} target="_blank" rel="noopener noreferrer">Try It <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-11 border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                <a href={tool.url} target="_blank" rel="noopener noreferrer">Learn More</a>
              </Button>
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
