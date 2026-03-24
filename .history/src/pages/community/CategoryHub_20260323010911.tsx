import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Grid3X3, ExternalLink } from "lucide-react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { AppCard } from "@/src/components/community/AppCard";
import { CommunitySidebar } from "@/src/components/community/CommunitySidebar";
import { getSubmissions } from "@/src/lib/community-store";
import { CATEGORY_LABELS, type AppCategory } from "@/src/lib/community-types";
import type { AppSubmission } from "@/src/lib/community-types";
import { generateCategoryContent } from "@/src/lib/seo-content";

/* ─── Per-category SEO content ──────────────────────────────────────── */
const CATEGORY_SEO: Record<
  AppCategory,
  {
    title: string;
    description: string;
    h1: string;
    intro: string;
    faq: { question: string; answer: string }[];
  }
> = {
  productivity: {
    title: "Productivity Apps for Beta Testing — Get Real User Feedback",
    description:
      "Discover and test productivity apps in beta. Developers share task managers, note-taking tools, workflow apps, and focus timers for community feedback.",
    h1: "Beta Testing Productive Apps",
    intro:
      "Productivity apps live or die by usability. On this page you'll find every productivity-focused submission on the DesignForge360 App Testers platform — from Pomodoro timers and task managers to note-taking systems and focus apps. Leave feedback, earn Repo Points, and help developers build tools people actually use.",
    faq: [
      {
        question: "How do I beta test a productivity app?",
        answer:
          "Click any app card, read the description, then click 'Visit App'. After trying it, leave your honest feedback and earn Repo Points. No sign-up required to read; sign in to leave feedback.",
      },
      {
        question: "Are these productivity apps free to test?",
        answer:
          "Yes. All apps listed here are actively seeking free beta testers. Developers share their apps to get unbiased feedback before launch.",
      },
    ],
  },
  social: {
    title: "Social & Community Apps for Beta Testing — Real User Feedback",
    description:
      "Find social apps and community platforms in beta. Help developers test chat apps, social networks, and community tools before public launch.",
    h1: "Beta Testing Social & Community Apps",
    intro:
      "Social apps need real users to uncover friction, unclear onboarding, and network-effect issues that can't be found in a lab. Browse social apps and community platforms currently seeking beta testers from the DesignForge360 community. Share your experience and help shape the next generation of social software.",
    faq: [
      {
        question: "Why do social apps need beta testers?",
        answer:
          "Social apps depend on network effects and real human interaction. Beta testers surface onboarding friction, confusing UX, and bugs that only appear when real people interact — not in isolated testing.",
      },
      {
        question: "Can I submit my own social app for beta testing?",
        answer:
          "Yes. Sign up, then click 'Submit App' to list your social app. It will appear in this category for the community to discover and test.",
      },
    ],
  },
  finance: {
    title: "Finance Apps for Beta Testing — Free User Feedback",
    description:
      "Discover fintech apps and financial tools seeking beta testers. Budgeting apps, investing tools, expense trackers — all open for community feedback.",
    h1: "Beta Testing Finance & Fintech Apps",
    intro:
      "Finance apps demand accuracy, security, and clarity. Finding bugs in a finance app before launch is critical. Browse fintech apps, budgeting tools, and investing platforms currently seeking real-world beta testers. Your feedback directly helps developers ship safer, more usable financial software.",
    faq: [
      {
        question: "Is it safe to beta test finance apps?",
        answer:
          "All apps listed here are developer-submitted. We recommend never entering real financial credentials in a beta app. Use demo credentials or test accounts when available.",
      },
      {
        question: "What should I look for when testing a finance app?",
        answer:
          "Focus on calculation accuracy, data privacy disclosures, ease of connecting accounts, and whether the UI clearly communicates financial data without confusion.",
      },
    ],
  },
  games: {
    title: "Games for Beta Testing — Play & Leave Honest Feedback",
    description:
      "Find indie games and mobile games seeking free beta testers. Play early access games and help developers improve gameplay, balance, and UI.",
    h1: "Beta Testing Indie Games & Mobile Games",
    intro:
      "Every great game starts as an unpolished prototype. On this page, developers share their games specifically for community playtesting. Try early builds, report bugs, rate the fun factor, and earn Repo Points for every piece of feedback that helps a game reach launch.",
    faq: [
      {
        question: "How is beta testing a game different from regular play?",
        answer:
          "Beta testers actively look for bugs, balance issues, and unclear mechanics — not just fun. Your feedback helps developers prioritize what to fix before public launch.",
      },
      {
        question: "Are these games playable on mobile?",
        answer:
          "Many games listed here are mobile-first. Each app card shows the platform (Android, iOS, Web, Desktop) so you can filter for games that match your device.",
      },
    ],
  },
  education: {
    title: "Educational Apps for Beta Testing — Improve Learning Tools",
    description:
      "Discover e-learning apps and educational platforms in beta. Help developers test tutoring apps, language learning tools, and study aids.",
    h1: "Beta Testing Education & E-Learning Apps",
    intro:
      "Educational apps must be clear, accurate, and motivating. Browse e-learning platforms, language learning apps, and study tools currently seeking beta feedback. Your detailed feedback on curriculum clarity, progress tracking, and UX helps developers build tools that genuinely improve learning outcomes.",
    faq: [
      {
        question: "What makes a good education app harder to test?",
        answer:
          "Educational apps require sustained engagement testing across multiple sessions — not just a single walkthrough. Consider whether the app keeps you motivated to return and whether the curriculum is clearly sequenced.",
      },
      {
        question: "Can teachers and educators submit educational apps?",
        answer:
          "Absolutely. The DesignForge360 community includes educators, parents, and learners — ideal audience for educational app feedback.",
      },
    ],
  },
  health: {
    title: "Health & Wellness Apps for Beta Testing — Real Community Feedback",
    description:
      "Find health apps, fitness trackers, and wellness tools in beta. Help developers test medical apps, mental health tools, and fitness platforms.",
    h1: "Beta Testing Health & Wellness Apps",
    intro:
      "Health apps carry a unique responsibility: inaccurate data or confusing UX can harm users. Browse fitness trackers, mental wellness tools, habit builders, and health monitors seeking beta feedback. Your testing helps developers catch critical issues before real users depend on this software for their wellbeing.",
    faq: [
      {
        question: "What should I focus on when beta testing a health app?",
        answer:
          "Check data accuracy, whether health claims are clearly labeled as estimates (not medical advice), accessibility, and whether the app is clear about what data it collects and how it's stored.",
      },
      {
        question: "Are health app betas safe to use?",
        answer:
          "Beta software may have bugs. Never use a beta health app as a substitute for professional medical advice. Treat data from beta apps as estimates only.",
      },
    ],
  },
  utility: {
    title: "Utility Apps for Beta Testing — Tools & Utility Software Feedback",
    description:
      "Discover utility apps and system tools in beta. Help developers test file managers, cleaners, converters, and productivity utilities.",
    h1: "Beta Testing Utility & Tool Apps",
    intro:
      "Utility apps need to be rock-solid — users depend on them for critical tasks like file management, format conversion, and system maintenance. Browse utility tools currently seeking community feedback and help developers identify edge cases, performance issues, and workflow gaps before launch.",
    faq: [
      {
        question: "What types of utility apps are listed here?",
        answer:
          "File managers, system cleaners, format converters, clipboard managers, automation tools, and any software that helps users complete specific tasks more efficiently.",
      },
      {
        question: "How do I report a bug in a utility app I'm testing?",
        answer:
          "Use the feedback form on each app's detail page. Describe the exact steps to reproduce the issue, your device/OS details, and the expected vs. actual behavior.",
      },
    ],
  },
  entertainment: {
    title: "Entertainment Apps for Beta Testing — Streaming, Media & More",
    description:
      "Find entertainment apps and media tools in beta. Beta test streaming apps, podcast platforms, video tools, and media players.",
    h1: "Beta Testing Entertainment & Media Apps",
    intro:
      "Entertainment apps live on user engagement and content discovery. Browse streaming platforms, podcast apps, video tools, and media players currently seeking beta testers. Your feedback on content discovery, performance, offline support, and ad experience directly shapes what millions of users will experience at launch.",
    faq: [
      {
        question: "What should I look for when beta testing an entertainment app?",
        answer:
          "Focus on content discovery, playback performance, buffering issues, notification quality, recommendation relevance, and whether the app makes it easy to find and return to content you enjoy.",
      },
      {
        question: "Do entertainment beta apps include real content?",
        answer:
          "It depends on the developer. Some use real content libraries, others use placeholder media. Each app listing describes what's included in the beta build.",
      },
    ],
  },
  "developer-tools": {
    title: "Developer Tools for Beta Testing — Dev Tools & APIs Feedback",
    description:
      "Discover developer tools, APIs, and dev utilities seeking beta testers. Code editors, deployment tools, API clients — all open for developer feedback.",
    h1: "Beta Testing Developer Tools & APIs",
    intro:
      "Developer tools are used by people who know exactly what good software looks like. That makes them the hardest audience to impress — and the most valuable for feedback. Browse code editors, CI/CD tools, API clients, documentation generators, and dev utilities currently seeking feedback from fellow developers on the DesignForge360 community.",
    faq: [
      {
        question: "What kinds of developer tools are listed here?",
        answer:
          "SDKs, CLI tools, code editors, API testing clients, deployment pipelines, documentation generators, debugging utilities, and any software primarily built for software developers.",
      },
      {
        question: "Can I leave detailed technical feedback?",
        answer:
          "Yes. The feedback form supports detailed text. Developers specifically want technical edge cases, error messages, performance benchmarks, and API design suggestions.",
      },
    ],
  },
  other: {
    title: "Apps for Beta Testing — Discover New Apps & Give Feedback",
    description:
      "Find apps across all categories seeking beta testers. Join the DesignForge360 community to test, review, and provide feedback on new software.",
    h1: "Beta Testing Apps Across All Categories",
    intro:
      "Not every great app fits neatly into a category. Browse miscellaneous apps, experimental software, and cross-category tools currently seeking beta testers on the DesignForge360 community. Every app here needs real user feedback to reach its potential.",
    faq: [
      {
        question: "What types of apps are in the 'Other' category?",
        answer:
          "Cross-platform utilities, experimental projects, niche tools, and any app that doesn't fit cleanly into productivity, social, finance, health, or developer tools categories.",
      },
      {
        question: "How do I suggest a new category?",
        answer:
          "Use the community feedback form or submit via our support page. We regularly review category suggestions from active community members.",
      },
    ],
  },
};

/* ─── Other categories for internal linking ─────────────────────────── */
const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as AppCategory[];

export function CategoryHub() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const cat = category as AppCategory;
  const seo = CATEGORY_SEO[cat];

  // Redirect invalid categories
  useEffect(() => {
    if (category && !CATEGORY_LABELS[cat]) {
      navigate("/community", { replace: true });
    }
  }, [category, cat, navigate]);

  useEffect(() => {
    if (!cat || !CATEGORY_LABELS[cat]) return;
    setLoading(true);
    setPage(0);
    getSubmissions({ category: cat, sort: "most-upvoted", page: 0 }).then(({ data, hasMore: more }) => {
      setApps(data);
      setHasMore(more);
      setLoading(false);
    });
  }, [cat]);

  async function loadMore() {
    const nextPage = page + 1;
    const { data, hasMore: more } = await getSubmissions({ category: cat, sort: "most-upvoted", page: nextPage });
    setApps((prev) => [...prev, ...data]);
    setHasMore(more);
    setPage(nextPage);
  }

  if (!seo) return null;

  const categoryLabel = CATEGORY_LABELS[cat] ?? cat;
  const catContent = generateCategoryContent(cat);

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonical={`/community/category/${cat}`}
        schema="CollectionPage"
        faqItems={seo.faq}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          { name: categoryLabel, url: `/community/category/${cat}` },
        ]}
      />

      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1200px]">
          <div className="flex gap-6">
            {/* ═══ Left Sidebar ═══ */}
            <aside className="hidden lg:flex lg:w-[220px] lg:shrink-0 lg:self-start lg:sticky lg:top-28">
              <CommunitySidebar />
            </aside>

            {/* ═══ Main Content ═══ */}
            <main className="flex-1 min-w-0">
              {/* Back nav */}
              <Link
                to="/community"
                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors"
              >
                <ArrowLeft size={16} />
                All Apps
              </Link>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Grid3X3 size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Category</p>
                    <h1 className="text-2xl font-bold text-white">{categoryLabel}</h1>
                  </div>
                </div>
                <p className="text-white/50 text-sm max-w-2xl leading-relaxed">{seo.intro}</p>
              </motion.div>

              {/* App grid */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="text-center py-24 text-white/30">
                  <Grid3X3 size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No {categoryLabel} apps yet</p>
                  <p className="text-sm mt-2">
                    Be the first to{" "}
                    <Link to="/community/submit" className="text-indigo-400 hover:underline">
                      submit a {categoryLabel} app
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apps.map((app, i) => (
                    <AppCard key={app.id} app={app} index={i} />
                  ))}
                  {hasMore && (
                    <button
                      onClick={loadMore}
                      className="w-full py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:border-white/20 text-sm transition-colors"
                    >
                      Load more {categoryLabel} apps
                    </button>
                  )}
                </div>
              )}

              {/* Internal links: FAQ section */}
              {seo.faq.length > 0 && (
                <section className="mt-16 border-t border-white/5 pt-10">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-6">
                    {seo.faq.map((item, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-medium text-white/80 mb-1">{item.question}</h3>
                        <p className="text-sm text-white/40 leading-relaxed">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Why this category matters */}
              <section className="mt-12 border-t border-white/5 pt-10">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Why {categoryLabel} Apps Matter
                </h2>
                <p className="text-sm text-white/45 leading-relaxed max-w-2xl">
                  {catContent.whyMatters}
                </p>
              </section>

              {/* How to choose the best apps */}
              <section className="mt-10 border-t border-white/5 pt-10">
                <h2 className="text-lg font-semibold text-white mb-3">
                  How to Choose the Best {categoryLabel} Apps
                </h2>
                <p className="text-sm text-white/45 leading-relaxed max-w-2xl">
                  {catContent.howToChoose}
                </p>
              </section>

              {/* Internal links: Other categories */}
              <section className="mt-12 border-t border-white/5 pt-10">
                <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-5">
                  Browse Other Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.filter((c) => c !== cat).map((c) => (
                    <Link
                      key={c}
                      to={`/community/category/${c}`}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-colors"
                    >
                      {CATEGORY_LABELS[c]}
                    </Link>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="mt-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white mb-1">
                      Submit your {categoryLabel} app for free beta testing
                    </h2>
                    <p className="text-sm text-white/40">
                      Get real user feedback from hundreds of testers. Earn Repo Points for every
                      review you receive.
                    </p>
                  </div>
                  <Link
                    to="/community/submit"
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
                  >
                    Submit App
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
