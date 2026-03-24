/**
 * Blog Article Page
 *
 * Renders rich, SEO-optimized articles from the content engine.
 * Each article has unique title, description, 800-1200 word body,
 * H2/H3 headings, FAQ, and internal links.
 */
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Clock, User, ChevronRight } from "lucide-react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { getBlogBySlug, BLOG_ARTICLES } from "@/src/lib/seo-content";

export function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? getBlogBySlug(slug) : undefined;

  if (!article) {
    navigate("/blog", { replace: true });
    return null;
  }

  return (
    <>
      <SEOHead
        title={article.title}
        description={article.description}
        canonical={`/blog/${article.slug}`}
        ogType="article"
        schema="Article"
        articlePublishedTime={article.publishedDate}
        articleModifiedTime={article.modifiedDate}
        articleAuthor={article.author}
        articleSection="App Testing"
        faqItems={article.faq}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: article.h1, url: `/blog/${article.slug}` },
        ]}
      />

      <article className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
          {/* Back */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            All Articles
          </Link>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">
              {article.h1}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <User size={14} />
                {article.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} />
                {article.readTime}
              </span>
              <span>
                {new Date(article.publishedDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </motion.header>

          {/* Body */}
          <div className="space-y-10">
            {article.content.map((section, si) => (
              <motion.section
                key={si}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: si * 0.03 }}
              >
                <h2 className="text-xl font-semibold text-white mb-3 capitalize">
                  {section.heading}
                </h2>
                {section.body.split("\n\n").map((para, pi) => (
                  <p
                    key={pi}
                    className="text-sm text-white/50 leading-relaxed mb-4 last:mb-0"
                  >
                    {para}
                  </p>
                ))}

                {/* Sub-sections (H3) */}
                {section.subSections?.map((sub, ssi) => (
                  <div key={ssi} className="mt-6 pl-4 border-l-2 border-white/5">
                    <h3 className="text-base font-medium text-white/80 mb-2">
                      {sub.heading}
                    </h3>
                    {sub.body.split("\n\n").map((para, pi) => (
                      <p
                        key={pi}
                        className="text-sm text-white/45 leading-relaxed mb-3 last:mb-0"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                ))}
              </motion.section>
            ))}
          </div>

          {/* FAQ */}
          {article.faq.length > 0 && (
            <section className="mt-16 border-t border-white/5 pt-10">
              <h2 className="text-xl font-semibold text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {article.faq.map((item, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-medium text-white/80 mb-1">
                      {item.question}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Internal Links */}
          <section className="mt-12 border-t border-white/5 pt-10">
            <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-4">
              Related Pages
            </h2>
            <div className="flex flex-wrap gap-2">
              {article.internalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>
    </>
  );
}

/* ─── Blog Index (listing) ──────────────────────────────────────────── */
export function BlogIndex() {
  return (
    <>
      <SEOHead
        title="Blog — App Testing Guides, Beta Testing Tips & Developer Advice"
        description="Expert guides on beta testing, app launches, finding testers, and building software that users love. Free advice backed by real community data."
        canonical="/blog"
        schema="CollectionPage"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ]}
      />

      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Blog
            </h1>
            <p className="text-white/50 text-sm max-w-xl leading-relaxed">
              Expert guides on beta testing, app launches, and building software
              that users love.
            </p>
          </motion.div>

          <div className="space-y-6">
            {BLOG_ARTICLES.map((article, i) => (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link
                  to={`/blog/${article.slug}`}
                  className="block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all p-6 group"
                >
                  <h2 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors mb-2">
                    {article.h1}
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed mb-3 line-clamp-2">
                    {article.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-white/30">
                    <span>{article.readTime}</span>
                    <span>
                      {new Date(article.publishedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1 text-indigo-400/50 group-hover:text-indigo-400 transition-colors ml-auto">
                      Read <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
