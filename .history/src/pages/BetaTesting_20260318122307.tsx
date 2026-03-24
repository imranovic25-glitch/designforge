/**
 * BetaTesting Landing Page — 4 high-intent variants
 *
 * Routes served by this component:
 *   /find-app-testers
 *   /get-beta-testers
 *   /test-my-app
 *   /free-app-testing
 *
 * Each route targets a distinct long-tail keyword cluster while sharing
 * the same layout and CTA funnel.
 */
import { useLocation, Link } from "react-router-dom";
import { motion } from "motion/react";
import { CheckCircle, ArrowRight, Users, MessageSquare, Star, Zap } from "lucide-react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { Layout } from "@/src/components/layout/Layout";

/* ─── Variant configuration ─────────────────────────────────────────── */
interface Variant {
  title: string;
  description: string;
  h1: string;
  h1Highlight: string;
  subheadline: string;
  ctaText: string;
  canonical: string;
  faq: { question: string; answer: string }[];
  keywords: string[];
}

const VARIANTS: Record<string, Variant> = {
  "/find-app-testers": {
    title: "Find App Testers — Get Real Beta Feedback from 1,000+ Users",
    description:
      "Find real app testers for your Android, iOS, or web app. Submit your app free and get detailed feedback from the DesignForge360 beta testing community.",
    h1: "Find Real App Testers",
    h1Highlight: "in Minutes",
    subheadline:
      "Submit your app to the DesignForge360 community and get honest, detailed feedback from real users — completely free.",
    ctaText: "Find Testers Now",
    canonical: "/find-app-testers",
    keywords: [
      "find app testers",
      "app beta testers",
      "find mobile app testers",
      "free app testing community",
    ],
    faq: [
      {
        question: "How do I find beta testers for my app?",
        answer:
          "Submit your app to the DesignForge360 community at designforge360.in/community. Your app is instantly visible to hundreds of active testers who leave detailed feedback in exchange for Repo Points.",
      },
      {
        question: "How many app testers will I get?",
        answer:
          "Results vary by app category and quality of your submission. Active apps typically receive 10–100 feedback entries within the first week. Boosted listings get prioritized visibility.",
      },
      {
        question: "Do I have to pay to find app testers?",
        answer:
          "No. Submitting your app and receiving feedback is completely free. Optional Boost and Priority Review power-ups are available using earned Repo Points.",
      },
      {
        question: "What platforms can I find testers for?",
        answer:
          "Android, iOS, Web, Desktop, and Cross-Platform apps are all supported. You can specify your target platform when submitting.",
      },
      {
        question: "How is DesignForge360 different from paid beta testing services?",
        answer:
          "DesignForge360 is community-driven. Testers provide feedback because they're genuinely interested in your app, not because they're being paid. This produces more authentic, detailed feedback than incentivized testing services.",
      },
    ],
  },

  "/get-beta-testers": {
    title: "Get Beta Testers — Free Beta Testing Platform for App Developers",
    description:
      "Get beta testers for your app instantly. DesignForge360's free platform connects app developers with thousands of real users ready to test and review.",
    h1: "Get Beta Testers",
    h1Highlight: "for Your App Free",
    subheadline:
      "Stop launching blindly. Get real beta testers to test your app before you go public — powered by the DesignForge360 community.",
    ctaText: "Get Beta Testers",
    canonical: "/get-beta-testers",
    keywords: [
      "get beta testers",
      "beta testers for app",
      "free beta testing",
      "beta test my app",
    ],
    faq: [
      {
        question: "How do I get beta testers for my mobile app?",
        answer:
          "Submit your app to DesignForge360's community hub. Your listing immediately reaches active testers who browse for new apps to test and review.",
      },
      {
        question: "How quickly can I get beta testers?",
        answer:
          "Your app appears in the community feed immediately after submission. Most apps receive their first piece of feedback within 24 hours of going live.",
      },
      {
        question: "Can I specify what kind of testers I'm looking for?",
        answer:
          "Yes. You can specify platform (Android/iOS/Web), category, and describe your ideal tester profile in your app description. You can also add testers slots to signal how many testers you're looking for.",
      },
      {
        question: "How is beta feedback structured?",
        answer:
          "Testers leave structured feedback covering UI/Design, Performance, Bugs, Features, Content, and Ease of Use — plus a free-text field for detailed observations. You see all feedback in your app's detail page.",
      },
      {
        question: "What's the difference between a free listing and a boosted listing?",
        answer:
          "Free listings appear in the standard feed, sorted by recency or community votes. Boosted listings appear with a highlighted badge and receive elevated placement for 48 hours, increasing visibility to active testers.",
      },
    ],
  },

  "/test-my-app": {
    title: "Test My App — Submit Your App for Free Community Beta Testing",
    description:
      "Submit your app and get it tested by a real community. Free beta testing for Android, iOS, and web apps. Real feedback. No paid subscriptions.",
    h1: "Test My App",
    h1Highlight: "with Real Users",
    subheadline:
      "Upload your app to DesignForge360 in under 2 minutes and receive honest, structured feedback from real testers worldwide.",
    ctaText: "Submit My App",
    canonical: "/test-my-app",
    keywords: [
      "test my app",
      "app testing service",
      "beta test app online",
      "app user testing free",
    ],
    faq: [
      {
        question: "How do I submit my app for testing?",
        answer:
          "Go to designforge360.in/community/submit, fill in your app details (name, description, category, platform, and a link to your app or TestFlight/Play Store beta), and click Submit. Your app appears in the community feed immediately.",
      },
      {
        question: "What information do I need to submit my app?",
        answer:
          "Your app name, a description (what it does and what feedback you're looking for), the platform (Android/iOS/Web/Desktop), category, and a direct link to your beta or test build.",
      },
      {
        question: "Can I include screenshots in my listing?",
        answer:
          "Yes. You can upload up to 5 screenshots when submitting your app. Screenshots dramatically increase click-through and tester engagement.",
      },
      {
        question: "What happens after I submit my app?",
        answer:
          "Your app appears in the community feed for active testers to discover. Testers click through, try your app, then return to leave structured feedback covering design, performance, bugs, and features.",
      },
      {
        question: "Can I respond to feedback?",
        answer:
          "Yes. You can reply to individual feedback entries, thank testers, ask follow-up questions, and engage directly with people testing your app.",
      },
    ],
  },

  "/free-app-testing": {
    title: "Free App Testing — Get Your App Tested by Real Users at No Cost",
    description:
      "Free app testing for Android, iOS, and web apps. Submit your app to the DesignForge360 community and get real user feedback without paying.",
    h1: "Free App Testing",
    h1Highlight: "for Every Developer",
    subheadline:
      "Professional-quality beta testing doesn't have to cost thousands. Get your app tested free by real users who care about giving great feedback.",
    ctaText: "Start Free Testing",
    canonical: "/free-app-testing",
    keywords: [
      "free app testing",
      "free beta testing for apps",
      "free user testing",
      "test app for free",
    ],
    faq: [
      {
        question: "Is DesignForge360 really free for app testing?",
        answer:
          "Yes. Submitting your app, receiving feedback, and interacting with testers is 100% free. There are no hidden fees, subscriptions, or credit cards required.",
      },
      {
        question: "What's the catch with free app testing?",
        answer:
          "No catch. DesignForge360 runs a community where testers earn Repo Points for leaving feedback — a points system that incentivizes quality reviews. Developers benefit from free beta testing; testers earn recognition and community status.",
      },
      {
        question: "How does free app testing compare to paid services?",
        answer:
          "Paid app testing services (like UserTesting or Testbirds) charge $30–$120 per tester session. DesignForge360's community model is free and produces authentic, motivated feedback from users genuinely interested in your app category.",
      },
      {
        question: "Are there limits on how many apps I can submit for free testing?",
        answer:
          "Currently there's no hard limit on submissions. You can submit multiple apps and manage all of them from your 'My Apps' dashboard.",
      },
      {
        question: "What types of feedback will my app receive?",
        answer:
          "Testers provide feedback across six dimensions: UI/Design, Performance, Bugs, Features, Content, and Ease of Use. Each feedback entry also includes a free-text field for detailed observations.",
      },
    ],
  },
};

const DEFAULT_VARIANT = VARIANTS["/find-app-testers"];

/* ─── Feature list ───────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Users,
    title: "Real Human Testers",
    description: "Active community members who genuinely try your app and leave detailed, structured feedback.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    icon: MessageSquare,
    title: "Structured Feedback",
    description: "Feedback covers UI/Design, Performance, Bugs, Features, Content, and Ease of Use — every session.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Star,
    title: "Honest Reviews",
    description: "Community members earn points for quality feedback — not for giving positive reviews. Expect the truth.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: Zap,
    title: "Live in Minutes",
    description: "Submit your app in under 2 minutes. Your listing goes live immediately with no approval wait.",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
];

const STEPS = [
  { n: "01", title: "Submit Your App", body: "Add your app name, description, platform, category, and a link to your beta or test build." },
  { n: "02", title: "Community Discovers It", body: "Your app appears in the feed for hundreds of active testers browsing for new apps to test." },
  { n: "03", title: "Receive Real Feedback", body: "Testers try your app and leave structured feedback covering every dimension of user experience." },
  { n: "04", title: "Iterate & Improve", body: "Read feedback, respond to testers, and ship a better app — before your public launch." },
];

const RELATED_LINKS = [
  { label: "Browse Android Apps", to: "/community/platform/android" },
  { label: "Browse iOS Apps", to: "/community/platform/ios" },
  { label: "Browse Web Apps", to: "/community/platform/web" },
  { label: "Community Hub", to: "/community" },
];

export function BetaTesting() {
  const { pathname } = useLocation();
  const variant = VARIANTS[pathname] ?? DEFAULT_VARIANT;

  return (
    <Layout>
      <SEOHead
        title={variant.title}
        description={variant.description}
        canonical={variant.canonical}
        schema="SoftwareApplication"
        memberCount={undefined}
        faqItems={variant.faq}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          { name: variant.h1, url: variant.canonical },
        ]}
      />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.18) 0%, transparent 70%)",
          }}
        />
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-medium uppercase tracking-widest mb-8">
              Beta Testing Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-[1.05]">
              {variant.h1}{" "}
              <span className="text-indigo-400">{variant.h1Highlight}</span>
            </h1>
            <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
              {variant.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/community/submit"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition-colors shadow-lg shadow-indigo-500/20"
              >
                {variant.ctaText}
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-medium text-base transition-colors"
              >
                Browse Community
              </Link>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/30"
          >
            {[
              "✓ Free to submit",
              "✓ No approval wait",
              "✓ Real user feedback",
              "✓ Structured reviews",
            ].map((t) => (
              <span key={t} className="text-white/40">
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Why developers choose DesignForge360
          </h2>
          <p className="text-center text-white/40 mb-14 max-w-2xl mx-auto">
            A community-first platform built to get your app in front of real users who actually care about giving useful feedback.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.07 }}
                className={`p-6 rounded-2xl border ${f.bg}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                  <f.icon size={20} className={f.color} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-white text-center mb-4">How it works</h2>
          <p className="text-center text-white/40 mb-14">
            From submission to real user feedback in four simple steps.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-4"
              >
                <div className="text-3xl font-black text-indigo-500/20 w-10 shrink-0 leading-none mt-1">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">{step.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/community/submit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-base transition-colors"
            >
              {variant.ctaText}
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            {variant.faq.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="border-b border-white/5 pb-8 last:border-0"
              >
                <div className="flex gap-4">
                  <CheckCircle size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-2">{item.question}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Internal links ───────────────────────────────────────── */}
      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-sm font-medium text-white/30 uppercase tracking-widest mb-6 text-center">
            Explore the Community
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {RELATED_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/25 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
