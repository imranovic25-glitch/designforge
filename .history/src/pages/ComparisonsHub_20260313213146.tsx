import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, PieChart, TrendingUp, ShieldCheck, FileSearch, PenTool, Image as ImageIcon } from "lucide-react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";

export function ComparisonsHub() {
  const comparisons = [
    {
      id: "best-credit-cards",
      title: "Best Credit Cards",
      description: "Compare top cards for rewards, travel, and cash back to maximize your spending.",
      category: "Finance",
      icon: <CreditCard className="h-8 w-8" />,
      path: "/comparisons/best-credit-cards"
    },
    {
      id: "best-budgeting-apps",
      title: "Best Budgeting Apps",
      description: "Top tools to track spending, manage your money, and reach your financial goals.",
      category: "Finance",
      icon: <PieChart className="h-8 w-8" />,
      path: "/comparisons/best-budgeting-apps"
    },
    {
      id: "best-investing-apps",
      title: "Best Investing Apps",
      description: "Platforms for beginners and advanced traders looking to build wealth.",
      category: "Finance",
      icon: <TrendingUp className="h-8 w-8" />,
      path: "/comparisons/best-investing-apps"
    },
    {
      id: "best-savings-accounts",
      title: "Best Savings Accounts",
      description: "High-yield options to keep your emergency fund safe and growing.",
      category: "Finance",
      icon: <ShieldCheck className="h-8 w-8" />,
      path: "/comparisons/best-savings-accounts"
    },
    {
      id: "best-resume-builders",
      title: "Best Resume Builders",
      description: "We compared the top resume builders to find which ones actually help you land interviews.",
      category: "Career",
      icon: <FileSearch className="h-8 w-8" />,
      path: "/comparisons/best-resume-builders"
    },
    {
      id: "best-ai-writing-tools",
      title: "Best AI Writing Tools",
      description: "An editorial review of the top AI writing assistants for content creators and professionals.",
      category: "Productivity",
      icon: <PenTool className="h-8 w-8" />,
      path: "/comparisons/best-ai-writing-tools"
    },
    {
      id: "best-ai-background-remover-tools",
      title: "Best AI Background Removers",
      description: "Which tool isolates subjects best? We tested the top options for speed and accuracy.",
      category: "Design",
      icon: <ImageIcon className="h-8 w-8" />,
      path: "/comparisons/best-ai-background-remover-tools"
    }
  ];

  return (
    <div className="min-h-screen bg-black pt-32 pb-24 selection:bg-orange-300/30 selection:text-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <RevealOnScroll className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/20 bg-orange-500/5 text-orange-400 text-xs font-medium uppercase tracking-widest mb-8">
            Editorial Comparisons
          </div>
          <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tight mb-8 leading-[1.1]">
            Expert picks to help you <span className="text-orange-400">choose smarter</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed">
            In-depth analysis and side-by-side comparisons to help you choose the right tools, apps, and services for your needs.
          </p>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comparisons.map((comp, i) => (
            <RevealOnScroll key={comp.id} delay={Math.min(i * 0.05, 0.35)} className="h-full">
            <Link to={comp.path} className="group glass-panel rounded-3xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]">
              <div className="h-48 bg-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                <div className="text-white/20 group-hover:text-white transition-colors transform group-hover:scale-110 duration-500 relative z-10">
                  {comp.icon}
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="text-xs font-medium text-white/40 mb-4 uppercase tracking-widest">{comp.category}</div>
                <h3 className="text-2xl font-medium text-white mb-4">{comp.title}</h3>
                <p className="text-white/50 mb-8 flex-1 font-light leading-relaxed">{comp.description}</p>
                <div className="flex items-center text-sm font-medium text-white/40 group-hover:text-white transition-colors uppercase tracking-widest mt-auto">
                  Read Comparison <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>            </RevealOnScroll>          ))}
        </div>
      </div>
    </div>
  );
}
