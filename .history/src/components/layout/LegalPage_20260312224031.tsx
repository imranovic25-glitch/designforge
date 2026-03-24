import { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 lg:px-12 selection:bg-white/30 selection:text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-6 leading-[1.1] tracking-tight">{title}</h1>
        {lastUpdated && (
          <p className="text-sm font-medium text-white/40 mb-16 uppercase tracking-widest">Last Updated: {lastUpdated}</p>
        )}
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-medium prose-p:text-white/70 prose-p:font-light prose-p:leading-relaxed prose-a:text-white prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-white/70 prose-strong:text-white prose-strong:font-medium prose-ul:text-white/70 prose-ol:text-white/70 prose-li:marker:text-white/30">
          {children}
        </div>
      </div>
    </div>
  );
}
