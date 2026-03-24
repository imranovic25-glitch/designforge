import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  icon?: ReactNode;
  faq?: { question: string; answer: string }[];
  faqItems?: { question: string; answer: string }[];
  relatedGuides?: { title: string; path: string }[];
  relatedComparisons?: { title: string; path: string }[];
}

export function ToolLayout({ title, description, children, icon, faq, faqItems, relatedGuides, relatedComparisons }: ToolLayoutProps) {
  const faqData = faq ?? faqItems ?? [];
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-white/30 selection:text-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          {icon && (
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 text-white mb-8">
              {icon}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight mb-6">{title}</h1>
          <p className="text-lg md:text-xl text-white/50 font-light">{description}</p>
        </div>

        {/* Tool Interface */}
        <div className="glass-panel rounded-[2rem] p-8 md:p-12 mb-24 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
        </div>

        {/* Below Tool Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* FAQ */}
          {faqData.length > 0 && (
            <div className="lg:col-span-2 space-y-12">
              <h2 className="text-3xl font-semibold text-white tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-10">
                {faqData.map((item, i) => (
                  <div key={i} className="border-b border-white/10 pb-10 last:border-0">
                    <h3 className="text-xl font-medium text-white mb-4">{item.question}</h3>
                    <p className="text-white/50 leading-relaxed font-light">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar */}
          <div className="space-y-8">
            {relatedGuides && relatedGuides.length > 0 && (
              <div className="glass-panel rounded-3xl p-8">
                <h3 className="text-sm font-semibold text-white/40 tracking-widest uppercase mb-6">Related Guides</h3>
                <ul className="space-y-4">
                  {relatedGuides.map((guide, i) => (
                    <li key={i}>
                      <Link to={guide.path} className="text-base text-white hover:text-white/70 flex items-start group transition-colors">
                        <ArrowRight className="mr-3 h-5 w-5 text-white/30 group-hover:text-white transition-colors shrink-0 mt-0.5" />
                        <span className="leading-snug">{guide.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {relatedComparisons && relatedComparisons.length > 0 && (
              <div className="glass-panel rounded-3xl p-8">
                <h3 className="text-sm font-semibold text-white/40 tracking-widest uppercase mb-6">Compare Options</h3>
                <ul className="space-y-4">
                  {relatedComparisons.map((comp, i) => (
                    <li key={i}>
                      <Link to={comp.path} className="text-base text-white hover:text-white/70 flex items-start group transition-colors">
                        <ArrowRight className="mr-3 h-5 w-5 text-white/30 group-hover:text-white transition-colors shrink-0 mt-0.5" />
                        <span className="leading-snug">{comp.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
