import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, SlidersHorizontal, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { AppCard } from "@/src/components/community/AppCard";
import { OnlineCounter } from "@/src/components/community/OnlineCounter";
import { RevealOnScroll } from "@/src/components/ui/RevealOnScroll";
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

      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">

          {/* Welcome toast */}
          <AnimatePresence>
            {welcomeMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 text-center text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl"
              >
                {welcomeMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <RevealOnScroll>
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                App Testers Community
              </h1>
              <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed">
                Share your app, get real feedback. Try others' apps, help them grow.
                <br className="hidden sm:block" />
                Simple as that.
              </p>
            </div>
          </RevealOnScroll>

          {/* Top Bar — Online + Submit */}
          <RevealOnScroll delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <OnlineCounter />
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
                    <span className="text-xs text-white/35">Repos</span>
                    <span className="text-xs font-semibold text-white tabular-nums">
                      {repoBalance ?? 0}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                        Admin
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <Link
                    to="/community/my-apps"
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    My Apps
                  </Link>
                )}
                <Link
                  to={user ? "/community/submit" : "/signin"}
                  className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                >
                  <Plus size={16} />
                  Share Your App
                </Link>
              </div>
            </div>
          </RevealOnScroll>

          {/* Search + Filter Bar */}
          <RevealOnScroll delay={0.15}>
            <div className="space-y-3 mb-8">
              {/* Search Row */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search apps…"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    showFilters
                      ? "border-white/20 bg-white/[0.06] text-white/70"
                      : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/60"
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span className="hidden sm:inline">Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white/40 hover:text-white/60 transition-all"
                  >
                    {SORT_OPTIONS.find((s) => s.value === sort)?.label}
                    <ChevronDown size={14} />
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
                    <div className="space-y-3 pt-2">
                      {/* Platform pills */}
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

                      {/* Category pills */}
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
            </div>
          </RevealOnScroll>

          {/* App List */}
          <div className="space-y-3">
            {apps.map((app, i) => (
              <AppCard key={app.id} app={app} onUpvote={handleUpvote} index={i} />
            ))}

            {loading && (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
              </div>
            )}

            {!loading && apps.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white/30 text-lg mb-2">No apps yet</p>
                <p className="text-white/20 text-sm mb-6">Be the first to share your app with the community!</p>
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

          {/* How It Works — for new visitors */}
          {apps.length === 0 && !loading && (
            <RevealOnScroll delay={0.2}>
              <div className="mt-16 grid sm:grid-cols-3 gap-6">
                {[
                  { step: "1", title: "Share your app", desc: "Post your link with a short description. Takes 30 seconds." },
                  { step: "2", title: "Get real feedback", desc: "Community members try your app and share honest thoughts." },
                  { step: "3", title: "Help others too", desc: "Try other apps and give feedback. Everyone grows together." },
                ].map((item) => (
                  <div key={item.step} className="text-center p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
                      <span className="text-sm font-bold text-white/50">{item.step}</span>
                    </div>
                    <h3 className="text-sm font-medium text-white/80 mb-1">{item.title}</h3>
                    <p className="text-xs text-white/30 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          )}
        </div>
      </div>
    </>
  );
}

export default CommunityHub;
