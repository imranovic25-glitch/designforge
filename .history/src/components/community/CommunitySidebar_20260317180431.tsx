import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, TrendingUp, MessageSquare, FolderOpen, Send, Trophy, HelpCircle, Plus, ShieldCheck, Coffee, Heart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { OnlineCounter } from "./OnlineCounter";
import { useAuth } from "@/src/lib/auth";
import { getMyRepoBalance, isCommunityAdmin } from "@/src/lib/community-store";

export function CommunitySidebar() {
  const { user } = useAuth();
  const [repoBalance, setRepoBalance] = useState<number | null>(null);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setRepoBalance(null); setIsAdmin(false); return; }
    let cancelled = false;
    (async () => {
      const [balance, admin] = await Promise.all([getMyRepoBalance(), isCommunityAdmin()]);
      if (cancelled) return;
      setRepoBalance(balance);
      setIsAdmin(admin);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <aside className="hidden lg:block w-[220px] shrink-0">
      <div className="sticky top-28 space-y-2 pb-6">
        <nav className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-0.5">
          <Link
            to="/community"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <Home size={16} /> Home
          </Link>
          <Link
            to="/community"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <TrendingUp size={16} /> Popular
          </Link>
          <Link
            to="/community"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <Trophy size={16} /> Top Reviewed
          </Link>
          <a
            href="#community-rules"
            onClick={(e) => { e.preventDefault(); document.getElementById('community-rules')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer"
          >
            <ShieldCheck size={16} /> Guidelines
          </a>

          <div className="h-px bg-white/[0.06] my-2" />

          {user && (
            <>
              <Link to="/community/my-apps" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                <FolderOpen size={16} /> My Apps
              </Link>
              <Link to="/community/chat" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                <MessageSquare size={16} /> Messages
              </Link>
              <Link to="/community/submit" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/70 hover:bg-white/[0.04] transition-all">
                <Send size={16} /> Submit App
              </Link>
            </>
          )}
        </nav>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">About Community</h3>
          <p className="text-xs text-white/35 leading-relaxed">Share your app, get real feedback from other developers and users.</p>
          <div className="flex items-center justify-between text-xs text-white/40">
            <OnlineCounter />
          </div>
          {user && repoBalance !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-xs text-white/40">Your Repos</span>
              <span className="text-xs font-bold text-white tabular-nums ml-auto">{repoBalance}</span>
              {isAdmin && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Admin</span>
              )}
            </div>
          )}
          <Link
            to={user ? "/community/submit" : "/signin"}
            className="w-full flex items-center justify-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/90 transition-all"
          >
            <Plus size={15} /> Share Your App
          </Link>
          <button
            onClick={() => setShowCoffeeModal(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#FF5E5B]/10 border border-[#FF5E5B]/20 text-[#FF5E5B] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#FF5E5B]/20 transition-all cursor-pointer"
          >
            <Coffee size={15} /> Buy Me a Coffee
          </button>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={12} /> How It Works
          </h3>
          {[
            { n: "1", t: "Share your app link" },
            { n: "2", t: "Get real comments" },
            { n: "3", t: "Help others & earn repos" },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">{s.n}</span>
              <span className="text-xs text-white/35">{s.t}</span>
            </div>
          ))}
        </div>

        <div id="community-rules" className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={12} /> Community Rules
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
              <span className="text-[10px] text-white/25 mt-0.5 shrink-0">{i + 1}.</span>
              <span className="text-[11px] text-white/35 leading-relaxed">{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coffee confirmation modal */}
      <AnimatePresence>
        {showCoffeeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCoffeeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm mx-4 text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCoffeeModal(false)}
                className="absolute top-3 right-3 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FF5E5B]/10 flex items-center justify-center">
                <Heart size={24} className="text-[#FF5E5B]" />
              </div>
              <h3 className="text-lg font-semibold text-white">Enjoying the Community?</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Your support keeps this platform free and helps us build better tools for developers like you.
              </p>
              <a
                href="https://ko-fi.com/designforge360"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#FF5E5B] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#FF5E5B]/90 transition-all"
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
    </aside>
  );
}
