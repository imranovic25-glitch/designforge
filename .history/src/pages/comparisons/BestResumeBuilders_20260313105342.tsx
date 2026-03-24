import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const builders = [
  {
    name: "Teal",
    tagline: "Best Overall Resume Builder",
    pricing: "Free tier available; Pro at $9/week",
    pros: [
      "AI-powered resume tailoring for each job application",
      "Real-time ATS optimization score and keyword matching",
      "Built-in job tracker to manage applications",
      "Cover letter generator included",
      "Chrome extension to save jobs from any job board"
    ]
  },
  {
    name: "Zety",
    tagline: "Best for Professional Templates",
    pricing: "From $2.70/week (billed monthly)",
    pros: [
      "20+ ATS-friendly professional templates",
      "Step-by-step guided resume builder",
      "Pre-written bullet points for 100+ job titles",
      "Cover letter builder with matching designs",
      "Instant PDF and TXT download formats"
    ]
  },
  {
    name: "Canva Resume Builder",
    tagline: "Best for Design-Forward Resumes",
    pricing: "Free; Canva Pro at $12.99/month",
    pros: [
      "Hundreds of visually stunning resume templates",
      "Full drag-and-drop layout customization",
      "Built-in portfolio and link sections",
      "Export as PDF, PNG, or shareable web link",
      "Free tier includes many premium templates"
    ]
  },
  {
    name: "Resume.io",
    tagline: "Best for Quick and Easy Creation",
    pricing: "From $2.95/week (7-day trial for $0.95)",
    pros: [
      "Simple, intuitive interface — build a resume in under 15 minutes",
      "Field-tested templates optimized for ATS",
      "Auto-formatting adjusts layout as you type",
      "Multi-language support for international job seekers",
      "Cover letter and resignation letter builders included"
    ]
  },
  {
    name: "Novoresume",
    tagline: "Best for Entry-Level and Career Changers",
    pricing: "Free tier available; Premium at $19.99/month",
    pros: [
      "Skills-forward templates ideal for limited experience",
      "Tailored content suggestions for career changers",
      "Real-time content feedback and improvement tips",
      "Portfolio and project sections for showcasing work",
      "One-click design adjustments with color and font options"
    ]
  }
];

export function BestResumeBuilders() {
  return (
    <ArticleLayout
      title="Best Resume Builders of 2026"
      description="We compared the top resume builders to find which ones actually help you land more interviews."
      category="Career"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="8 min read"
      breadcrumbs={[
        { label: "Comparisons", href: "/comparisons" },
        { label: "Best Resume Builders" }
      ]}
    >
      <p>
        Generic word processor resumes often fail to pass Applicant Tracking Systems (ATS) before a human ever sees them. A good resume builder helps you create ATS-optimized, visually polished documents without spending hours on formatting. Here are the five best options we tested.
      </p>

      <h2>Our Top Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {builders.map((builder) => (
          <div key={builder.name} className="glass-panel rounded-3xl p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-2">{builder.name}</h3>
                <p className="text-white/50 font-light">{builder.tagline}</p>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{builder.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {builder.pros.map((pro) => (
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

      <h2>Choosing the Right Resume Builder</h2>
      <p>
        Consider whether ATS optimization is a priority (it usually is), what level of design customization you want, whether you need a cover letter builder, and your budget. Most offer free trials — test a few before committing to a subscription.
      </p>

      <p className="text-white/40 text-sm italic">
        Disclaimer: This article contains affiliate links. We may earn a commission if you sign up through our links. This does not influence our editorial recommendations.
      </p>
    </ArticleLayout>
  );
}
