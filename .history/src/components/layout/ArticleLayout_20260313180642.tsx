import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, User } from "lucide-react";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";

interface ArticleLayoutProps {
  title: string;
  description: string;
  category: string;
  categoryLink: string;
  author?: string;
  date?: string;
  readTime?: string;
  children: ReactNode;
}

export function ArticleLayout({
  title,
  description,
  category,
  categoryLink,
  author = "DesignForge Research",
  date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  readTime = "5 min read",
  children
}: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24 px-6 lg:px-12 selection:bg-white/30 selection:text-white">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <RevealOnScroll className="mb-12">
          <Link 
            to={categoryLink}
            className="inline-flex items-center text-sm font-medium text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {category}
          </Link>
        </RevealOnScroll>

        {/* Article Header */}
        <RevealOnScroll delay={0.1}>
        <header className="mb-16 pb-12 border-b border-white/10">
          <div className="inline-block px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/70 text-xs font-medium tracking-widest uppercase mb-8">
            {category}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-white mb-8 leading-[1.1] tracking-tight">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-white/50 mb-10 leading-relaxed font-light">
            {description}
          </p>
          
          <div className="flex flex-wrap items-center gap-8 text-sm text-white/40 font-medium">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {author}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {date}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {readTime}
            </div>
          </div>
        </header>
        </RevealOnScroll>

        {/* Article Content */}
        <RevealOnScroll delay={0.15}>
        <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-medium prose-p:text-white/70 prose-p:font-light prose-p:leading-relaxed prose-a:text-white prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-white/70 prose-strong:text-white prose-strong:font-medium prose-ul:text-white/70 prose-ol:text-white/70 prose-li:marker:text-white/30 prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-hr:border-white/10">
          {children}
        </article>
        </RevealOnScroll>
      </div>
    </div>
  );
}
