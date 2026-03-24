import { ArticleLayout } from "@/src/components/layout/ArticleLayout";
import { Check, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const builders = [
  {
    name: "Teal",
    tagline: "Best Overall Resume Builder",
    pricing: "Free tier available; Pro at $9/week",
    logo: "https://logo.clearbit.com/tealhq.com",
    url: "https://www.tealhq.com/",
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
    logo: "https://logo.clearbit.com/zety.com",
    url: "https://zety.com/",
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
    logo: "https://logo.clearbit.com/canva.com",
    url: "https://www.canva.com/resumes/",
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
    logo: "https://logo.clearbit.com/resume.io",
    url: "https://resume.io/",
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
    logo: "https://logo.clearbit.com/novoresume.com",
    url: "https://novoresume.com/",
    pros: [
      "Skills-forward templates ideal for limited experience",
      "Tailored content suggestions for career changers",
      "Real-time content feedback and improvement tips",
      "Portfolio and project sections for showcasing work",
      "One-click design adjustments with color and font options"
    ]
  },
  {
    name: "Kickresume",
    tagline: "Best AI-Powered Writer",
    pricing: "Free tier; Premium from $19/month",
    logo: "https://logo.clearbit.com/kickresume.com",
    url: "https://www.kickresume.com/",
    pros: [
      "AI resume writer generates content from job title",
      "35+ ATS-tested templates with modern designs",
      "Website builder to create an online resume portfolio",
      "Cover letter AI generator included",
      "Supports 30+ languages"
    ]
  },
  {
    name: "ResumeGenius",
    tagline: "Best for Speed and Simplicity",
    pricing: "From $7.95/month (14-day access for $2.95)",
    logo: "https://logo.clearbit.com/resumegenius.com",
    url: "https://resumegenius.com/",
    pros: [
      "Build a resume in under 10 minutes",
      "Step-by-step wizard with pre-written phrases",
      "ATS-compatible templates tested by HR professionals",
      "Cover letter builder with 100+ samples",
      "Download as PDF, DOCX, or plain text"
    ]
  },
  {
    name: "VisualCV",
    tagline: "Best for Online Portfolio Resumes",
    pricing: "Free basic; Pro at $24/month",
    logo: "https://logo.clearbit.com/visualcv.com",
    url: "https://www.visualcv.com/",
    pros: [
      "Shareable online resume with custom URL",
      "Track who views your resume with analytics",
      "25+ professionally designed templates",
      "Export as PDF with ATS-friendly formatting",
      "Integrated personal website builder"
    ]
  },
  {
    name: "Enhancv",
    tagline: "Best for Standing Out with Personality",
    pricing: "Free tier; Pro at $24.99/month",
    logo: "https://logo.clearbit.com/enhancv.com",
    url: "https://enhancv.com/",
    pros: [
      "Unique sections like 'My Time', 'Strengths', and philosophy",
      "Content analyzer with real-time improvement suggestions",
      "ATS-optimized and design-forward templates",
      "Tailored content for career changers",
      "LinkedIn import for quick profile setup"
    ]
  },
  {
    name: "Indeed Resume Builder",
    tagline: "Best Free Option with Job Search Integration",
    pricing: "Completely free",
    logo: "https://logo.clearbit.com/indeed.com",
    url: "https://www.indeed.com/create-resume",
    pros: [
      "100% free to create and download resumes",
      "Directly apply to millions of jobs on Indeed",
      "Simple, guided builder with clean templates",
      "Auto-fill from existing Indeed profile",
      "Employers can find your resume through Indeed's database"
    ]
  }
];

export function BestResumeBuilders() {
  return (
    <ArticleLayout
      title="Best Resume Builders of 2026"
      description="We compared the top resume builders to find which ones actually help you land more interviews."
      category="Comparisons"
      categoryLink="/comparisons"
      author="DesignForge360 Editorial"
      date="March 1, 2026"
      readTime="10 min read"
    >
      <p>
        Generic word processor resumes often fail to pass Applicant Tracking Systems (ATS) before a human ever sees them. A good resume builder helps you create ATS-optimized, visually polished documents without spending hours on formatting. Here are the top 10 options we tested.
      </p>

      <h2>Our Top 10 Picks</h2>

      <div className="not-prose space-y-8 my-10">
        {builders.map((builder, index) => (
          <div key={builder.name} className="glass-panel rounded-3xl p-8 md:p-10 border border-sky-500/10 hover:border-sky-500/20 transition-colors">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-xs font-bold text-white">{index + 1}</div>
                  <img src={builder.logo} alt={builder.name + " logo"} className="w-14 h-14 rounded-xl bg-white p-1.5 object-contain" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">{builder.name}</h3>
                  <p className="text-white/50 font-light">{builder.tagline}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end shrink-0">
                <span className="text-sm text-white/40">Pricing: <span className="text-white font-medium">{builder.pricing}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              {builder.pros.map((pro) => (
                <div key={pro} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/70 font-light">{pro}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="rounded-full px-8 h-11 bg-sky-600 hover:bg-sky-500 text-white">
                <a href={builder.url} target="_blank" rel="noopener noreferrer">Try It <ExternalLink className="ml-2 h-3.5 w-3.5" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8 h-11 border-sky-500/30 text-sky-400 hover:bg-sky-500/10">
                <a href={builder.url} target="_blank" rel="noopener noreferrer">Learn More</a>
              </Button>
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
