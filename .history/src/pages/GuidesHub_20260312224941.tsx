import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";

export function GuidesHub() {
  const guides = [
    {
      id: "how-to-remove-image-background",
      title: "How to Remove Image Backgrounds",
      description: "A step-by-step guide to isolating subjects in your photos for professional results.",
      category: "Design",
      path: "/guides/how-to-remove-image-background"
    },
    {
      id: "how-to-compress-pdf",
      title: "How to Compress PDF Files",
      description: "Learn how to reduce file size without sacrificing document quality or readability.",
      category: "Productivity",
      path: "/guides/how-to-compress-pdf"
    },
    {
      id: "how-to-merge-pdf-files",
      title: "How to Merge PDF Files",
      description: "The simplest way to combine multiple documents into one seamless file.",
      category: "Productivity",
      path: "/guides/how-to-merge-pdf-files"
    },
    {
      id: "how-currency-conversion-works",
      title: "How Currency Conversion Works",
      description: "Understanding exchange rates, spreads, and hidden transaction fees.",
      category: "Finance",
      path: "/guides/how-currency-conversion-works"
    },
    {
      id: "compound-interest-explained",
      title: "Compound Interest Explained",
      description: "How your money makes money over time, and why starting early matters.",
      category: "Finance",
      path: "/guides/compound-interest-explained"
    },
    {
      id: "how-loan-emi-works",
      title: "How Loan EMI Works",
      description: "Understanding principal, interest, and the math behind amortization.",
      category: "Finance",
      path: "/guides/how-loan-emi-works"
    },
    {
      id: "how-to-compare-credit-cards",
      title: "How to Compare Credit Cards",
      description: "What to look for when choosing your next card, from APR to rewards programs.",
      category: "Finance",
      path: "/guides/how-to-compare-credit-cards"
    },
    {
      id: "how-to-choose-a-resume-builder",
      title: "How to Choose a Resume Builder",
      description: "Key features to look for in professional resume software.",
      category: "Career",
      path: "/guides/how-to-choose-a-resume-builder"
    },
    {
      id: "how-to-choose-ai-writing-tools",
      title: "How to Choose AI Writing Tools",
      description: "Finding the right AI assistant for your specific writing needs.",
      category: "Productivity",
      path: "/guides/how-to-choose-ai-writing-tools"
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-white/30 selection:text-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="max-w-3xl mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">Actionable Guides</h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            Step-by-step tutorials, educational content, and practical advice to help you work smarter and make better decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guides.map((guide) => (
            <Link key={guide.id} to={guide.path} className="group glass-panel rounded-3xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04] h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-white/40 uppercase tracking-widest">{guide.category}</span>
              </div>
              <h3 className="text-2xl font-medium text-white mb-4 group-hover:text-white/80 transition-colors">{guide.title}</h3>
              <p className="text-white/50 mb-10 flex-1 font-light leading-relaxed">{guide.description}</p>
              <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors uppercase tracking-widest mt-auto">
                Read Guide <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
