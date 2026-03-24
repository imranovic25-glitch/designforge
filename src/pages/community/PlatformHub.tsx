import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, Smartphone, ExternalLink } from "lucide-react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { AppCard } from "@/src/components/community/AppCard";
import { CommunitySidebar } from "@/src/components/community/CommunitySidebar";
import { getSubmissions } from "@/src/lib/community-store";
import { PLATFORM_LABELS, type Platform } from "@/src/lib/community-types";
import type { AppSubmission } from "@/src/lib/community-types";
import { generatePlatformContent } from "@/src/lib/seo-content";

/* ─── Per-platform SEO content ──────────────────────────────────────── */
const PLATFORM_SEO: Record<
  Platform,
  {
    title: string;
    description: string;
    h1: string;
    intro: string;
    faq: { question: string; answer: string }[];
  }
> = {
  android: {
    title: "Android Apps for Beta Testing — Get Real User Feedback Free",
    description:
      "Find Android apps seeking free beta testers. Developers share beta APKs and Play Store beta links for community feedback before public launch.",
    h1: "Beta Testing Android Apps",
    intro:
      "Android has the most fragmented device landscape of any mobile platform — thousands of device models, multiple OS versions, and varying screen sizes. That's exactly why Android apps need real testers before launch. Browse Android apps currently seeking community feedback on the DesignForge360 platform. Install, test, and leave detailed feedback to earn Repo Points.",
    faq: [
      {
        question: "How do I join an Android beta test?",
        answer:
          "Click the app card to view the app page, then click 'Visit App' to access the beta link. Most Android betas use Google Play's testing program or direct APK downloads.",
      },
      {
        question: "Is it safe to install beta Android APKs?",
        answer:
          "Beta apps may be less stable than production releases. Only install from developers you trust. All apps listed here are submitted by real developers — but exercise appropriate caution with any beta software.",
      },
      {
        question: "What Android versions should I test on?",
        answer:
          "Unless the developer specifies a target version, test on your actual device. Report your Android version and device model in your feedback — this information is critical for developers tracking compatibility.",
      },
    ],
  },
  ios: {
    title: "iOS Apps for Beta Testing — TestFlight Betas & App Feedback",
    description:
      "Discover iOS apps seeking beta testers via TestFlight. Help developers test iPhone and iPad apps before App Store launch. Free community feedback.",
    h1: "Beta Testing iOS Apps via TestFlight",
    intro:
      "iOS apps must pass Apple's strict review process — but TestFlight betas can reach real users before that. Browse iOS apps currently in beta on the DesignForge360 community. Most iOS betas use Apple TestFlight, meaning installation is safe and sandboxed. Your feedback helps developers polish their apps before the App Store submission.",
    faq: [
      {
        question: "Do I need TestFlight to beta test iOS apps?",
        answer:
          "Most iOS betas use Apple TestFlight, which requires the free TestFlight app from the App Store. When you click a beta link, you'll be directed to join the TestFlight beta automatically.",
      },
      {
        question: "Is TestFlight beta testing safe?",
        answer:
          "Yes. TestFlight apps are sandboxed and reviewed by Apple before developers can distribute them. Beta builds may have bugs but cannot access your data beyond what you explicitly grant.",
      },
      {
        question: "What makes good iOS beta feedback?",
        answer:
          "Describe which iPhone model and iOS version you used, steps to reproduce any issues, screenshots if possible, and what you expected to happen vs. what actually occurred.",
      },
    ],
  },
  web: {
    title: "Web Apps for Beta Testing — SaaS, Dashboards & Web Tools Feedback",
    description:
      "Find web apps and SaaS tools seeking beta testers. Test dashboards, productivity tools, web platforms, and browser apps before public launch.",
    h1: "Beta Testing Web Apps & SaaS Platforms",
    intro:
      "Web apps are the fastest to access — no installation required. Browse web apps, SaaS dashboards, browser tools, and web-based platforms currently seeking beta feedback. Test directly in your browser, then leave feedback on usability, performance, feature completeness, and overall experience. No app store required.",
    faq: [
      {
        question: "How do I test a web app?",
        answer:
          "Click 'Visit App' on the app's detail page. The beta web app opens directly in your browser. Test it as a real user would, then return to leave your detailed feedback.",
      },
      {
        question: "What browsers should I test web apps in?",
        answer:
          "Unless specified, test in your primary browser. If you discover browser-specific issues (e.g., broken in Firefox or Safari), mention that in your feedback — it's extremely valuable information.",
      },
      {
        question: "What makes good SaaS beta feedback?",
        answer:
          "Focus on onboarding clarity, whether the core value proposition is immediately obvious, loading performance, mobile responsiveness, and whether the UI guides you naturally through the intended workflow.",
      },
    ],
  },
  desktop: {
    title: "Desktop Apps for Beta Testing — Windows, Mac & Linux Betas",
    description:
      "Find desktop apps for Windows, Mac, and Linux seeking beta testers. Help developers test native apps before public release.",
    h1: "Beta Testing Desktop Applications",
    intro:
      "Desktop apps need performance, stability, and OS-level integration testing that simply can't happen without real hardware. Browse Windows, macOS, and Linux applications currently seeking beta testers on the DesignForge360 community. Your testing on real hardware uncovers crashes, performance bottlenecks, and system compatibility issues that developers can't replicate in isolation.",
    faq: [
      {
        question: "Is it safe to install beta desktop apps?",
        answer:
          "Exercise standard caution with any software installation. All apps listed here are submitted by real developers, but beta software may be less stable. Always download from the official link provided by the developer.",
      },
      {
        question: "What information should I include in desktop app feedback?",
        answer:
          "Include your OS (Windows/macOS/Linux), OS version, processor type (Intel/Apple Silicon/AMD), RAM, and any relevant hardware specs — especially for performance-sensitive apps.",
      },
    ],
  },
  "cross-platform": {
    title: "Cross-Platform Apps for Beta Testing — All Devices, Real Feedback",
    description:
      "Find cross-platform apps (React Native, Flutter, Electron) seeking testers on Android, iOS, and web simultaneously.",
    h1: "Beta Testing Cross-Platform Apps",
    intro:
      "Cross-platform apps — built with React Native, Flutter, Electron, or similar frameworks — aim to run identically on Android, iOS, and web. But platform-specific quirks always surface in real testing. Browse cross-platform apps currently seeking testers across multiple devices. Your feedback helps developers catch platform-specific rendering bugs, performance differences, and feature gaps that only appear on specific OS and device combinations.",
    faq: [
      {
        question: "What are cross-platform apps?",
        answer:
          "Apps built with frameworks like Flutter, React Native, Ionic, or Electron that target multiple platforms (Android, iOS, web, desktop) from a single codebase.",
      },
      {
        question: "Why do cross-platform apps need extra testing?",
        answer:
          "Despite sharing a codebase, cross-platform apps render differently on each platform, have different performance characteristics, and interact with OS features in platform-specific ways. Real device testing is the only way to catch these differences.",
      },
    ],
  },
};

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

const PLATFORM_ICON_COLORS: Record<Platform, string> = {
  android: "text-green-400",
  ios: "text-blue-400",
  web: "text-amber-400",
  desktop: "text-purple-400",
  "cross-platform": "text-indigo-400",
};

export function PlatformHub() {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const plat = platform as Platform;
  const seo = PLATFORM_SEO[plat];

  useEffect(() => {
    if (platform && !PLATFORM_LABELS[plat]) {
      navigate("/community", { replace: true });
    }
  }, [platform, plat, navigate]);

  useEffect(() => {
    if (!plat || !PLATFORM_LABELS[plat]) return;
    setLoading(true);
    setPage(0);
    getSubmissions({ platform: plat, sort: "most-upvoted", page: 0 }).then(({ data, hasMore: more }) => {
      setApps(data);
      setHasMore(more);
      setLoading(false);
    });
  }, [plat]);

  async function loadMore() {
    const nextPage = page + 1;
    const { data, hasMore: more } = await getSubmissions({ platform: plat, sort: "most-upvoted", page: nextPage });
    setApps((prev) => [...prev, ...data]);
    setHasMore(more);
    setPage(nextPage);
  }

  if (!seo) return null;

  const platformLabel = PLATFORM_LABELS[plat] ?? plat;
  const iconColor = PLATFORM_ICON_COLORS[plat] ?? "text-white/50";
  const platContent = generatePlatformContent(plat);

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        canonical={`/community/platform/${plat}`}
        schema="CollectionPage"
        faqItems={seo.faq}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          { name: platformLabel, url: `/community/platform/${plat}` },
        ]}
      />

      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1200px]">
          <div className="flex gap-6">
            <aside className="hidden lg:flex lg:w-[220px] lg:shrink-0 lg:self-start lg:sticky lg:top-28">
              <CommunitySidebar />
            </aside>

            <main className="flex-1 min-w-0">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors"
              >
                <ArrowLeft size={16} />
                All Apps
              </Link>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                    <Smartphone size={18} className={iconColor} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Platform</p>
                    <h1 className="text-2xl font-bold text-white">{platformLabel}</h1>
                  </div>
                </div>
                <p className="text-white/50 text-sm max-w-2xl leading-relaxed">{seo.intro}</p>
              </motion.div>

              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : apps.length === 0 ? (
                <div className="text-center py-24 text-white/30">
                  <Smartphone size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No {platformLabel} apps yet</p>
                  <p className="text-sm mt-2">
                    Be the first to{" "}
                    <Link to="/community/submit" className="text-indigo-400 hover:underline">
                      submit a {platformLabel} app
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
                      Load more {platformLabel} apps
                    </button>
                  )}
                </div>
              )}

              {/* FAQ */}
              {seo.faq.length > 0 && (
                <section className="mt-16 border-t border-white/5 pt-10">
                  <h2 className="text-lg font-semibold text-white mb-6">Frequently Asked Questions</h2>
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

              {/* Platform-specific testing tips */}
              <section className="mt-12 border-t border-white/5 pt-10">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {platformLabel} Testing Tips
                </h2>
                <div className="space-y-3">
                  {platContent.testingTips.map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-xs font-bold text-indigo-400/50 mt-0.5 w-5 shrink-0">{i + 1}.</span>
                      <p className="text-sm text-white/45 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Best practices */}
              <section className="mt-10 border-t border-white/5 pt-10">
                <h2 className="text-lg font-semibold text-white mb-3">
                  Best Practices for {platformLabel} Beta Testing
                </h2>
                <p className="text-sm text-white/45 leading-relaxed max-w-2xl">
                  {platContent.bestPractices}
                </p>
              </section>

              {/* Other platforms */}
              <section className="mt-12 border-t border-white/5 pt-10">
                <h2 className="text-sm font-medium text-white/40 uppercase tracking-widest mb-5">
                  Browse Other Platforms
                </h2>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLATFORMS.filter((p) => p !== plat).map((p) => (
                    <Link
                      key={p}
                      to={`/community/platform/${p}`}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-colors"
                    >
                      {PLATFORM_LABELS[p]}
                    </Link>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="mt-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/15">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white mb-1">
                      Submit your {platformLabel} app for free beta testing
                    </h2>
                    <p className="text-sm text-white/40">
                      Get real feedback from hundreds of testers. Free to submit — no approval wait.
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
