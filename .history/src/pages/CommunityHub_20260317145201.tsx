import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, SlidersHorizontal, ChevronDown, Home, TrendingUp, Heart, MessageSquare, FolderOpen, Send, Trophy, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { AppCard } from "@/src/components/community/AppCard";
import { OnlineCounter } from "@/src/components/community/OnlineCounter";
import { useAuth } from "@/src/lib/auth";
import { getSubmissions, toggleUpvote, getUserUpvotes, getMyRepoBalance, isCommunityAdmin, claimWelcomeRepos } from "@/src/lib/community-store";
import type { AppSubmission, Platform, AppCategory, SortOption } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/src/lib/community-types";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most-upvoted", label: "Most Upvoted" },
  { value: "most-feedback", label: "Most Feedback" },
  { value: "needs-love", label: "Needs Love" },
];

export function CommunityHub() {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [repoBalance, setRepoBalance] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [category, setCategory] = useState<AppCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [welcomeMsg, setWelcomeMsg] = useState("");

  useEffect(() => {
    if (!user) {
      setRepoBalance(null);
      setIsAdmin(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        // Claim welcome repos on first community visit
        const welcome = await claimWelcomeRepos();
        if (!cancelled && welcome.granted) {
          setWelcomeMsg(`🎉 Welcome! You received 15 free repos to get started.`);
          setTimeout(() => { if (!cancelled) setWelcomeMsg(""); }, 6000);
        }
        const [balance, admin] = await Promise.all([getMyRepoBalance(), isCommunityAdmin()]);
        if (cancelled) return;
        setRepoBalance(balance);
        setIsAdmin(admin);
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

    // Enrich with user upvotes
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

  // Debounced search
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

  // Fetch next page when page increments (triggered by loadMore)
  useEffect(() => {
    if (page > 0) loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <>
      <SEOHead
        title="App Testers Community — Share & Get Feedback"
        description="Share your app with real users and get honest feedback. A community for developers and creators to exchange app links and improve together."
        canonical="/community"
        schema="WebSite"
      />

      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1200px]">

          {/* Welcome onboarding */}
          <AnimatePresence>
            {welcomeMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">🎉 Welcome to App Testers!</h2>
                    <p className="text-sm text-emerald-400 mt-1">You received <span className="font-bold">15 free repos</span> to get started.</p>
                  </div>
                  <button onClick={() => setWelcomeMsg("")} className="text-white/30 hover:text-white/60 transition-colors p-1">
                    <X size={16} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">1</span>
                    <div>
                      <p className="text-sm font-medium text-white/80">Submit your app</p>
                      <p className="text-xs text-white/40 mt-0.5">Share your app link and screenshots to get feedback from real users.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">2</span>
                    <div>
                      <p className="text-sm font-medium text-white/80">Comment on others</p>
                      <p className="text-xs text-white/40 mt-0.5">Leave helpful comments on other apps to earn 2 repos per comment.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/[0.04] rounded-xl p-3 border border-white/[0.06]">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0">3</span>
                    <div>
                      <p className="text-sm font-medium text-white/80">Follow the rules</p>
                      <p className="text-xs text-white/40 mt-0.5">Read the Community Rules in the sidebar. Posts that violate guidelines are auto-removed.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-6">
            {/* ═══════ Left Sidebar ═══════ */}
            <aside className="hidden lg:block w-[220px] shrink-0">
              <div className="sticky top-28 space-y-2">
                {/* Navigation */}
                <nav className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-0.5">
                  <button
                    onClick={() => { setSort("newest"); setPlatform("all"); setCategory("all"); setSearch(""); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      sort === "newest" && platform === "all" && category === "all" && !search
                        ? "bg-white/[0.08] text-white font-medium"
                        : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Home size={16} /> Home
                  </button>
                  <button
                    onClick={() => setSort("most-upvoted")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      sort === "most-upvoted"
                        ? "bg-white/[0.08] text-white font-medium"
                        : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <TrendingUp size={16} /> Popular
                  </button>
                  <button
                    onClick={() => setSort("most-feedback")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      sort === "most-feedback"
                        ? "bg-white/[0.08] text-white font-medium"
                        : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Trophy size={16} /> Top Reviewed
                  </button>
                  <button
                    onClick={() => setSort("needs-love")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      sort === "needs-love"
                        ? "bg-white/[0.08] text-white font-medium"
                        : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Heart size={16} /> Needs Love
                  </button>

                  <div className="h-px bg-white/[0.06] my-2" />

                  {user && (
                    <>
                      <Link
                        to="/community/my-apps"
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                      >
                        <FolderOpen size={16} /> My Apps
                      </Link>
                      <Link
                        to="/community/chat"
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                      >
                        <MessageSquare size={16} /> Messages
                      </Link>
                      <Link
                        to="/community/submit"
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
                      >
                        <Send size={16} /> Submit App
                      </Link>
                    </>
                  )}
                </nav>

                {/* Community info box */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">About Community</h3>
                  <p className="text-xs text-white/35 leading-relaxed">
                    Share your app, get real feedback from other developers and users. Upvote the best apps.
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <OnlineCounter />
                  </div>
                  {user && repoBalance !== null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <span className="text-xs text-white/40">Your Repos</span>
                      <span className="text-xs font-bold text-white tabular-nums ml-auto">
                        {repoBalance}
                      </span>
                      {isAdmin && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                          Admin
                        </span>
                      )}
                    </div>
                  )}
                  <Link
                    to={user ? "/community/submit" : "/signin"}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-all"
                  >
                    <Plus size={15} />
                    Share Your App
                  </Link>
                </div>

                {/* How it works */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle size={12} /> How It Works
                  </h3>
                  {[
                    { n: "1", t: "Share your app link" },
                    { n: "2", t: "Get real feedback" },
                    { n: "3", t: "Help others & earn repos" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">{s.n}</span>
                      <span className="text-xs text-white/35">{s.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* ═══════ Main Feed ═══════ */}
            <main className="flex-1 min-w-0">
              {/* Mobile header */}
              <div className="lg:hidden text-center mb-6">
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
                      className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                      showFilters
                        ? "border-white/20 bg-white/[0.06] text-white/70"
                        : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/60"
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                  </button>

                  {/* Sort (mobile only — desktop uses sidebar) */}
                  <div className="relative lg:hidden">
                    <button
                      onClick={() => setSortOpen(!sortOpen)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white/40 hover:text-white/60 transition-all"
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
                          className="absolute right-0 top-full mt-1 w-44 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-30"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => { setSort(opt.value); setSortOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                sort === opt.value
                                  ? "text-white bg-white/[0.06]"
                                  : "text-white/50 hover:text-white hover:bg-white/[0.04]"
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
                          <label className="block text-[11px] text-white/30 uppercase tracking-wider mb-2">Platform</label>
                          <div className="flex flex-wrap gap-2">
                            {(["all", ...Object.keys(PLATFORM_LABELS)] as (Platform | "all")[]).map((p) => (
                              <button
                                key={p}
                                onClick={() => setPlatform(p)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                  platform === p
                                    ? "border-white/30 bg-white/10 text-white"
                                    : "border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15"
                                }`}
                              >
                                {p === "all" ? "All" : PLATFORM_LABELS[p]}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] text-white/30 uppercase tracking-wider mb-2">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {(["all", ...Object.keys(CATEGORY_LABELS)] as (AppCategory | "all")[]).map((c) => (
                              <button
                                key={c}
                                onClick={() => setCategory(c)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                  category === c
                                    ? "border-white/30 bg-white/10 text-white"
                                    : "border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15"
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
                      <Link to="/community/my-apps" className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:text-white/60 transition-colors">My Apps</Link>
                      <Link to="/community/chat" className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-white/[0.08] text-white/40 hover:text-white/60 transition-colors">Messages</Link>
                    </>
                  )}
                  <Link
                    to={user ? "/community/submit" : "/signin"}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white text-black font-medium"
                  >
                    + Share App
                  </Link>
                </div>
              </div>

              {/* Feed heading */}
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-[11px] text-white/30 uppercase tracking-widest font-medium">
                  {sort === "newest" ? "Latest" : sort === "most-upvoted" ? "Popular" : sort === "most-feedback" ? "Top Reviewed" : "Needs Love"}
                  {platform !== "all" && ` · ${PLATFORM_LABELS[platform]}`}
                  {category !== "all" && ` · ${CATEGORY_LABELS[category]}`}
                </span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </div>

              {/* App List */}
              <div className="space-y-4">
                {apps.map((app, i) => (
                  <AppCard key={app.id} app={app} onUpvote={handleUpvote} index={i} />
                ))}

                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
                  </div>
                )}

                {!loading && apps.length === 0 && (
                  <div className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <p className="text-white/30 text-lg mb-2">No apps yet</p>
                    <p className="text-white/35 text-sm mb-6">Be the first to share your app with the community!</p>
                    <Link
                      to={user ? "/community/submit" : "/signin"}
                      className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                    >
                      <Plus size={16} />
                      Share Your App
                    </Link>
                  </div>
                )}

                {hasMore && !loading && (
                  <button
                    onClick={loadMore}
                    className="w-full py-3 text-sm text-white/40 hover:text-white/70 border border-white/[0.06] rounded-xl hover:bg-white/[0.03] transition-all"
                  >
                    Load More
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommunityHub;
