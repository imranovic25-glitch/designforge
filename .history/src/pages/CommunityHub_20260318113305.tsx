import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Plus, SlidersHorizontal, ChevronDown, Home, TrendingUp, Trophy, X, Coffee, Heart, HelpCircle, ShieldCheck, Sparkles, Trash2, Gift, Copy, Check, ChevronUp, Pin, Zap, Star, Coins, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { AppCard } from "@/src/components/community/AppCard";
import { CommunitySidebar } from "@/src/components/community/CommunitySidebar";
import { OnlineCounter } from "@/src/components/community/OnlineCounter";
import { useAuth } from "@/src/lib/auth";
import { getSubmissions, toggleUpvote, getUserUpvotes, getMyRepoBalance, isCommunityAdmin, claimWelcomeRepos, deleteAllSubmissions, getMyReferralCode, getTotalMemberCount } from "@/src/lib/community-store";
import type { AppSubmission, Platform, AppCategory, SortOption } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/src/lib/community-types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most-upvoted", label: "Most Upvoted" },  { value: "most-liked", label: "Top Liked" },
  { value: "most-loved", label: "Top Loved" },  { value: "most-feedback", label: "Most Feedback" },
];

export function CommunityHub() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoBalance, setRepoBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [category, setCategory] = useState<AppCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>(() => {
    const sp = searchParams.get("sort");
    if (sp === "most-upvoted" || sp === "most-feedback" || sp === "newest") return sp;
    return "newest";
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [showRepoPoints, setShowRepoPoints] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const [welcomeMsg, setWelcomeMsg] = useState("");

  // Fetch total member count once on mount (public, no auth required)
  useEffect(() => {
    getTotalMemberCount().then(setMemberCount);
  }, []);

  const handleDeleteAll = async () => {
    setDeleting(true);
    const result = await deleteAllSubmissions();
    setDeleting(false);
    setShowDeleteConfirm(false);
    if (result.deleted > 0) {
      setApps([]);
    }
  };

  useEffect(() => {
    if (!user) {
      setRepoBalance(null);
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const welcome = await claimWelcomeRepos();
        if (!cancelled && welcome.granted) {
          setWelcomeMsg("active");
        }
        const [balance, admin, refCode] = await Promise.all([getMyRepoBalance(), isCommunityAdmin(), getMyReferralCode()]);
        if (cancelled) return;
        setRepoBalance(balance);
        setIsAdmin(admin);
        setReferralCode(refCode);
      } catch {
        if (cancelled) return;
        setRepoBalance(0);
        setIsAdmin(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const loadApps = useCallback(async (reset = false) => {
    setLoading(true);
    const p = reset ? 0 : page;
    const result = await getSubmissions({ page: p, platform, category, sort, search });

    let enriched = result.data;
    if (user && enriched.length) {
      const upvoted = await getUserUpvotes(user.id, enriched.map((a) => a.id));
      enriched = enriched.map((a) => ({ ...a, has_upvoted: upvoted.has(a.id) }));
    }

    if (reset) {
      setApps(enriched);
      setPage(0);
    } else {
      setApps((prev) => (p === 0 ? enriched : [...prev, ...enriched]));
    }
    setHasMore(result.hasMore);
    setLoading(false);
  }, [platform, category, sort, search, page, user]);

  useEffect(() => {
    loadApps(true);
  }, [platform, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => loadApps(true), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpvote = async (id: string) => {
    if (!user) return;
    const result = await toggleUpvote(id);
    if (result) {
      setApps((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, upvotes: result.newCount, has_upvoted: result.upvoted } : a
        )
      );
    }
  };

  const loadMore = () => {
    setPage((p) => p + 1);
  };

  useEffect(() => {
    if (page > 0) loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const resetFilters = () => {
    setPlatform("all");
    setCategory("all");
    setSearch("");
  };

  return (
    <>
      <SEOHead
        title="App Testers Community — Share Apps & Get Real User Feedback"
        description="Join the App Testers community to share your app with real users, get honest feedback, and discover new apps. Free beta testing platform for developers, indie hackers, and creators."
        canonical="/community"
        schema="WebSite"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
        ]}
        faqItems={[
          { question: "What is the App Testers Community?", answer: "A free platform where developers and creators share their apps to get real feedback from other community members." },
          { question: "How do I submit my app for testing?", answer: "Sign in, earn repos through participation, then click 'Submit App' to share your project with the community." },
          { question: "What are repos and how do I earn them?", answer: "Repos are community credits. You get 15 free repos on signup. Earn more by reviewing apps, upvoting, liking, loving, and sharing posts." },
          { question: "Is it free to use?", answer: "Yes, the App Testers community is completely free. Submit apps, give feedback, and chat with other members at no cost." },
        ]}
      />

      {/* ═══════ Reddit-style 3-column layout ═══════ */}
      <div className="pt-[70px] h-screen flex flex-col">
        <div className="flex-1 flex max-w-[1400px] w-full mx-auto overflow-hidden">

          {/* ═══════ LEFT SIDEBAR ═══════ */}
          <aside className="hidden lg:flex flex-col w-[220px] shrink-0 border-r border-white/[0.06] overflow-y-auto community-scroll bg-black">
            <CommunitySidebar sort={sort} onSortChange={setSort} onResetFilters={resetFilters} repoBalance={repoBalance} />
          </aside>

          {/* ═══════ CENTER FEED ═══════ */}
          <main className="flex-1 min-w-0 overflow-y-auto community-scroll">
            <div className="max-w-[680px] mx-auto px-4 lg:px-6 py-4">

              {/* Welcome onboarding */}
              <AnimatePresence>
                {welcomeMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-5 rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.08] to-emerald-600/[0.04] p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                          <Sparkles size={16} className="text-emerald-400" /> Welcome to App Testers!
                        </h2>
                        <p className="text-sm text-emerald-400 mt-1">You received <span className="font-bold">15 free repos</span> to get started.</p>
                      </div>
                      <button onClick={() => setWelcomeMsg("")} className="text-white/30 hover:text-white/60 transition-colors p-1">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {[
                        { n: "1", t: "Submit your app", d: "Share your app link to get feedback." },
                        { n: "2", t: "Comment on others", d: "Earn 2 repos per helpful comment." },
                        { n: "3", t: "Follow the rules", d: "Read guidelines before posting." },
                      ].map((s) => (
                        <div key={s.n} className="flex items-start gap-2.5 bg-white/[0.04] rounded-lg p-2.5 border border-white/[0.06]">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">{s.n}</span>
                          <div>
                            <p className="text-xs font-medium text-white/80">{s.t}</p>
                            <p className="text-[11px] text-white/35 mt-0.5">{s.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sort tabs (desktop) */}
              <div className="hidden lg:flex items-center gap-1 mb-4 rounded-xl bg-white/[0.02] border border-white/[0.06] p-1 flex-wrap">
                <button
                  onClick={() => { resetFilters(); setSort("newest"); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sort === "newest" && platform === "all" && category === "all" && !search
                      ? "bg-blue-500/12 text-blue-400"
                      : "text-white/50 hover:text-blue-300 hover:bg-blue-500/[0.06]"
                  }`}
                >
                  <Home size={14} /> Home
                </button>
                <button
                  onClick={() => setSort("most-upvoted")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sort === "most-upvoted"
                      ? "bg-blue-500/12 text-blue-400"
                      : "text-white/50 hover:text-blue-300 hover:bg-blue-500/[0.06]"
                  }`}
                >
                  <TrendingUp size={14} /> Popular
                </button>
                <button
                  onClick={() => setSort("most-liked")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sort === "most-liked"
                      ? "bg-blue-500/12 text-blue-400"
                      : "text-white/50 hover:text-blue-300 hover:bg-blue-500/[0.06]"
                  }`}
                >
                  <ThumbsUp size={14} /> Top Liked
                </button>
                <button
                  onClick={() => setSort("most-loved")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sort === "most-loved"
                      ? "bg-pink-500/12 text-pink-400"
                      : "text-white/50 hover:text-pink-300 hover:bg-pink-500/[0.06]"
                  }`}
                >
                  <Heart size={14} /> Top Loved
                </button>
                <button
                  onClick={() => setSort("most-feedback")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    sort === "most-feedback"
                      ? "bg-blue-500/12 text-blue-400"
                      : "text-white/50 hover:text-blue-300 hover:bg-blue-500/[0.06]"
                  }`}
                >
                  <Trophy size={14} /> Top Reviewed
                </button>
              </div>

              {/* Mobile header */}
              <div className="lg:hidden text-center mb-5">
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1">App Testers</h1>
                <p className="text-sm text-white/40">Share apps, get real feedback</p>
              </div>

              {/* Search + Filter Bar */}
              <div className="space-y-3 mb-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search apps…"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/90 placeholder:text-white/25 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                      showFilters
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-blue-300 hover:border-blue-500/20"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                  </button>

                  {/* Sort (mobile only) */}
                  <div className="relative lg:hidden">
                    <button
                      onClick={() => setSortOpen(!sortOpen)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white/50 hover:text-blue-300 transition-all"
                    >
                      {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                      <ChevronDown size={13} />
                    </button>
                    <AnimatePresence>
                      {sortOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute right-0 top-full mt-1 w-44 bg-[#0e0e0e] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-30"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setSort(opt.value); setSortOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                sort === opt.value
                                  ? "text-blue-400 bg-blue-500/10"
                                  : "text-white/50 hover:text-blue-300 hover:bg-blue-500/[0.06]"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Expandable Filters */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-1 pb-2 px-1">
                        <div>
                          <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">Platform</label>
                          <div className="flex flex-wrap gap-2">
                            {(["all", ...Object.keys(PLATFORM_LABELS)] as (Platform | "all")[]).map((p) => (
                              <button
                                key={p}
                                onClick={() => setPlatform(p)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                  platform === p
                                    ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                                    : "border-white/[0.08] text-white/45 hover:text-blue-300 hover:border-blue-500/20"
                                }`}
                              >
                                {p === "all" ? "All" : PLATFORM_LABELS[p]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/40 uppercase tracking-wider mb-2 font-medium">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {(["all", ...Object.keys(CATEGORY_LABELS)] as (AppCategory | "all")[]).map((c) => (
                              <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                  category === c
                                    ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                                    : "border-white/[0.08] text-white/45 hover:text-blue-300 hover:border-blue-500/20"
                                }`}
                              >
                                {c === "all" ? "All" : CATEGORY_LABELS[c]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mobile quick-links */}
                <div className="flex gap-2 lg:hidden overflow-x-auto pb-1 -mx-1 px-1">
                  {user && (
                    <>
                      <Link to="/community/my-apps" className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/50 hover:text-blue-300 hover:border-blue-500/20 transition-all">My Apps</Link>
                      <Link to="/community/chat" className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/50 hover:text-blue-300 hover:border-blue-500/20 transition-all">Messages</Link>
                    </>
                  )}
                  <Link
                    to={user ? "/community/submit" : "/signin"}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
                  >
                    + Share App
                  </Link>
                </div>
              </div>

              {/* Feed heading */}
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                <span className={`text-[11px] uppercase tracking-widest font-semibold text-blue-400/60`}>
                  {sort === "newest" ? "Latest" : sort === "most-upvoted" ? "Popular" : sort === "most-liked" ? "Top Liked" : sort === "most-loved" ? "Top Loved" : "Top Reviewed"}
                  {platform !== "all" && ` · ${PLATFORM_LABELS[platform]}`}
                  {category !== "all" && ` · ${CATEGORY_LABELS[category]}`}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              </div>

              {/* App List */}
              <div className="space-y-3 pb-8">
                {apps.map((app, i) => (
                  <AppCard key={app.id} app={app} onUpvote={handleUpvote} index={i} />
                ))}

                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
                  </div>
                )}

                {!loading && apps.length === 0 && (
                  <div className="text-center py-16 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-white/50 text-lg mb-2">No apps yet</p>
                    <p className="text-white/30 text-sm mb-6">Be the first to share your app with the community!</p>
                    <Link
                      to={user ? "/community/submit" : "/signin"}
                      className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                    >
                      <Plus size={16} />
                      Share Your App
                    </Link>
                  </div>
                )}

                {hasMore && !loading && (
                  <button
                    onClick={loadMore}
                    className="w-full py-3 text-sm text-white/50 hover:text-blue-300 border border-white/[0.06] rounded-xl hover:bg-blue-500/[0.05] hover:border-blue-500/20 transition-all"
                  >
                    Load More
                  </button>
                )}
              </div>
            </div>
          </main>

          {/* ═══════ RIGHT SIDEBAR ═══════ */}
          <aside className="hidden xl:flex flex-col w-[300px] shrink-0 border-l border-white/[0.06] overflow-y-auto community-scroll bg-black">
            <div className="p-4 space-y-3">

              {/* About Community */}
              <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                <div className="bg-blue-500/10 px-4 py-3">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">About Community</h3>
                </div>
                <div className="p-4 space-y-3 bg-white/[0.02]">
                  <p className="text-xs text-white/55 leading-relaxed">Share your app, get real feedback from other developers and users.</p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <OnlineCounter />
                  </div>
                  {memberCount !== null && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                      <span className="text-[11px] text-white/35">Total Members</span>
                      <span className="text-sm font-bold text-white/70 tabular-nums">
                        {memberCount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Your Repos — clickable to expand points system */}
              {user && repoBalance !== null && (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <button
                    onClick={() => setShowRepoPoints((p) => !p)}
                    className="w-full bg-emerald-500/10 px-4 py-2.5 flex items-center justify-between hover:bg-emerald-500/15 transition-colors"
                  >
                    <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Coins size={11} /> Repo Points
                    </h3>
                    {showRepoPoints ? <ChevronUp size={12} className="text-emerald-400/60" /> : <ChevronDown size={12} className="text-emerald-400/60" />}
                  </button>
                  <div className="p-4 bg-white/[0.02]">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white tabular-nums">{repoBalance}</span>
                      <span className="text-[11px] text-white/35">repos</span>
                      {isAdmin && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium">Admin</span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/35 mt-1">
                      Click to see how to earn & spend repos.
                    </p>

                    <AnimatePresence>
                      {showRepoPoints && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-3">
                            {/* Earn section */}
                            <div>
                              <h4 className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Earn Repos</h4>
                              <div className="space-y-1">
                                {[
                                  { action: "Welcome bonus", points: "+15", color: "text-emerald-400", desc: "On first sign-up" },
                                  { action: "Write feedback", points: "+1", color: "text-emerald-400", desc: "Per app reviewed" },
                                  { action: "Upvote a post", points: "+1", color: "text-emerald-400", desc: "Once per post" },
                                  { action: "Like a post", points: "+1", color: "text-emerald-400", desc: "Once per post" },
                                  { action: "Love a post", points: "+1", color: "text-emerald-400", desc: "Once per post" },
                                  { action: "Share a post", points: "+2", color: "text-emerald-400", desc: "Once per post" },
                                  { action: "Report content", points: "+1", color: "text-emerald-400", desc: "Valid reports only" },
                                  { action: "Refer a friend", points: "+30", color: "text-purple-400", desc: "When they sign up" },
                                  { action: "Get referred", points: "+10", color: "text-purple-400", desc: "Bonus on sign-up" },
                                ].map((item) => (
                                  <div key={item.action} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.02]">
                                    <div className="flex-1 min-w-0">
                                      <span className="text-[11px] text-white/50">{item.action}</span>
                                      <span className="text-[9px] text-white/25 ml-1.5">{item.desc}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold ${item.color} shrink-0 ml-2`}>{item.points}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Spend section */}
                            <div>
                              <h4 className="text-[9px] font-bold text-orange-400 uppercase tracking-wider mb-2">Spend Repos</h4>
                              <div className="space-y-1">
                                {[
                                  { action: "Submit your app", points: "-15", color: "text-orange-400", desc: "Post to community" },
                                  { action: "Pin post 24h", points: "-25", color: "text-amber-400", desc: "Stay at top", icon: Pin },
                                  { action: "Priority review", points: "-10", color: "text-blue-400", desc: "Get reviewed first", icon: Star },
                                  { action: "Boost visibility", points: "-25", color: "text-pink-400", desc: "48h highlight", icon: Zap },
                                ].map((item) => (
                                  <div key={item.action} className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.02]">
                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                      {item.icon && <item.icon size={10} className={item.color} />}
                                      <span className="text-[11px] text-white/50">{item.action}</span>
                                      <span className="text-[9px] text-white/25">{item.desc}</span>
                                    </div>
                                    <span className={`text-[11px] font-bold ${item.color} shrink-0 ml-2`}>{item.points}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Share Your App CTA */}
              <Link
                to={user ? "/community/submit" : "/signin"}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
              >
                <Plus size={16} /> Share Your App
              </Link>

              {/* Referral Program */}
              {user && referralCode && (
                <div className="rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="bg-purple-500/10 px-4 py-2.5">
                    <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Gift size={11} /> Refer & Earn
                    </h3>
                  </div>
                  <div className="p-4 bg-white/[0.02] space-y-2.5">
                    <p className="text-[11px] text-white/40 leading-relaxed">
                      Share your code — you get <span className="text-purple-400 font-semibold">30 repos</span>, they get <span className="text-emerald-400 font-semibold">10 bonus repos</span>.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-purple-300 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-center tracking-widest select-all">
                        {referralCode}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(referralCode);
                          setReferralCopied(true);
                          setTimeout(() => setReferralCopied(false), 2000);
                        }}
                        className="p-2 rounded-lg border border-white/[0.08] text-white/40 hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/10 transition-all"
                      >
                        {referralCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/25 text-center">
                      {referralCopied ? "Copied to clipboard!" : "Share this code with friends"}
                    </p>
                  </div>
                </div>
              )}

              {/* Buy Me a Coffee — modern gradient */}
              <button
                onClick={() => setShowCoffeeModal(true)}
                className="group w-full relative overflow-hidden rounded-xl p-[1px] cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-2 bg-black hover:bg-white/[0.03] rounded-[11px] px-4 py-3 transition-colors">
                  <Coffee size={16} className="text-orange-400" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Buy Me a Coffee
                  </span>
                </div>
              </button>

              {/* How It Works */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
                <h3 className="text-[10px] font-bold text-white/55 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={11} className="text-blue-400" /> How It Works
                </h3>
                {[
                  { n: "1", t: "Share your app link", c: "text-blue-400" },
                  { n: "2", t: "Get real comments", c: "text-emerald-400" },
                  { n: "3", t: "Help others & earn repos", c: "text-orange-400" },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold ${s.c} shrink-0`}>{s.n}</span>
                    <span className="text-xs text-white/45">{s.t}</span>
                  </div>
                ))}
              </div>

              {/* Community Rules */}
              <div id="community-rules" className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
                <h3 className="text-[10px] font-bold text-white/55 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-amber-400" /> Community Rules
                </h3>
                {[
                  "Post only real apps with working links",
                  "Include at least one screenshot if possible",
                  "No spam, duplicates, or self-promotion loops",
                  "Keep comments constructive & respectful",
                  "No NSFW, malware, or deceptive content",
                  "One post per app — update, don't repost",
                  "Posts violating rules are auto-removed",
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-white/25 mt-0.5 shrink-0 w-3 text-right">{i + 1}.</span>
                    <span className="text-[11px] text-white/40 leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>

              {/* Admin Tools — only visible to admins */}
              {isAdmin && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 space-y-3">
                  <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck size={11} /> Admin Tools
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} /> Delete All Posts
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Delete All confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-black border border-red-500/20 rounded-2xl p-7 max-w-sm mx-4 text-center space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete All Posts?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                This will permanently delete <span className="text-red-400 font-semibold">all submissions</span> from the community. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="flex items-center justify-center gap-2 w-full bg-red-500 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Trash2 size={16} /> Yes, Delete Everything</>
                )}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm text-white/30 hover:text-white/50 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coffee confirmation modal */}
      <AnimatePresence>
        {showCoffeeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCoffeeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-black border border-white/[0.08] rounded-2xl p-7 max-w-sm mx-4 text-center space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCoffeeModal(false)}
                className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 via-pink-500/20 to-purple-500/20 flex items-center justify-center">
                <Heart size={28} className="text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Enjoying the Community?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Your support keeps this platform free and helps us build better tools for developers like you.
              </p>
              <a
                href="https://ko-fi.com/designforge360"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-500/20"
                onClick={() => setShowCoffeeModal(false)}
              >
                <Coffee size={16} />
                Buy us a $3 coffee
              </a>
              <button
                onClick={() => setShowCoffeeModal(false)}
                className="text-sm text-white/30 hover:text-white/50 transition-colors"
              >
                Maybe later
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default CommunityHub;
