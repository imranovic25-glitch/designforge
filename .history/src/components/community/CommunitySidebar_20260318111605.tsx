import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, TrendingUp, Trophy, ShieldCheck, Pin, Zap, Star,
  ChevronDown, ChevronUp, User, Coins, FolderOpen, Send,
  Heart, ThumbsUp, Share2, ArrowUp, Flag, Gift, Check, MessageCircle,
} from "lucide-react";
import { useAuth } from "@/src/lib/auth";
import type { SortOption } from "@/src/lib/community-types";
import { supabase } from "@/src/lib/supabase";
import { OnlineIndicator } from "./OnlineIndicator";

interface OnlineUser {
  id: string;
  name: string;
  avatar: string | null;
}

interface CommunitySidebarProps {
  sort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  onResetFilters?: () => void;
  repoBalance?: number | null;
}

export function CommunitySidebar({ sort = "newest", onSortChange, onResetFilters, repoBalance }: CommunitySidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showPoints, setShowPoints] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const prevIdsRef = useRef("");

  // Presence channel — stable user list (only updates when users actually change)
  useEffect(() => {
    const channelKey = user?.id ?? `anon-${Math.random().toString(36).slice(2)}`;
    const channel = supabase.channel("community-sidebar-presence", {
      config: { presence: { key: channelKey } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = Object.entries(state).map(([key, arr]) => {
          const p = (arr as any[])[0];
          return { id: key, name: p?.user_name ?? "Anonymous", avatar: p?.user_avatar ?? null };
        });
        const newIds = users.map((u) => u.id).sort().join(",");
        if (newIds !== prevIdsRef.current) {
          prevIdsRef.current = newIds;
          setOnlineUsers(users);
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await channel.track({
            online_at: new Date().toISOString(),
            user_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Anonymous",
            user_avatar: user.user_metadata?.avatar_url ?? null,
          });
        }
      });
    return () => { channel.unsubscribe(); };
  }, [user?.id]);

  const isOnHub = location.pathname === "/community";
  const isHome = isOnHub && sort === "newest";
  const isPopular = isOnHub && sort === "most-upvoted";
  const isTopReviewed = isOnHub && sort === "most-feedback";

  const handleSort = (value: SortOption, reset?: boolean) => {
    if (onSortChange) {
      if (reset) onResetFilters?.();
      onSortChange(value);
    } else {
      navigate(`/community?sort=${value}`);
    }
  };

  const navCls = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
      active
        ? "bg-blue-500/10 text-blue-400"
        : "text-white/60 hover:bg-blue-500/[0.06] hover:text-white"
    }`;

  const EARN_POINTS = [
    { icon: Check,         label: "Welcome bonus",   pts: "+15", color: "text-emerald-400" },
    { icon: MessageCircle, label: "Write feedback",   pts: "+1",  color: "text-emerald-400" },
    { icon: ArrowUp,       label: "Upvote a post",    pts: "+1",  color: "text-emerald-400" },
    { icon: ThumbsUp,      label: "Like a post",      pts: "+1",  color: "text-emerald-400" },
    { icon: Heart,         label: "Love a post",      pts: "+1",  color: "text-emerald-400" },
    { icon: Share2,        label: "Share a post",     pts: "+2",  color: "text-emerald-400" },
    { icon: Flag,          label: "Report content",   pts: "+1",  color: "text-emerald-400" },
    { icon: Gift,          label: "Refer a friend",   pts: "+30", color: "text-purple-400"  },
    { icon: Gift,          label: "Get referred",     pts: "+10", color: "text-purple-400"  },
  ];

  const SPEND_POINTS = [
    { icon: Send,          label: "Submit app",       pts: "-15", color: "text-orange-400" },
    { icon: Pin,           label: "Pin post 24h",     pts: "-25", color: "text-amber-400"  },
    { icon: Star,          label: "Priority review",  pts: "-10", color: "text-blue-400"   },
    { icon: Zap,           label: "Boost 48h",        pts: "-25", color: "text-pink-400"   },
  ];

  return (
    <nav className="py-3 px-2 space-y-0.5">
      <button onClick={() => handleSort("newest", true)} className={navCls(isHome)}>
        <Home size={18} /> Home
      </button>
      <button onClick={() => handleSort("most-upvoted")} className={navCls(isPopular)}>
        <TrendingUp size={18} /> Popular
      </button>
      <button onClick={() => handleSort("most-feedback")} className={navCls(isTopReviewed)}>
        <Trophy size={18} /> Top Reviewed
      </button>

      <div className="h-px bg-white/[0.06] my-3 mx-1" />

      {user && (
        <>
          <Link to="/community/my-apps" className={navCls(location.pathname === "/community/my-apps")}>
            <FolderOpen size={18} /> My Apps
          </Link>
          <Link to="/community/submit" className={navCls(location.pathname === "/community/submit")}>
            <Send size={18} /> Submit App
          </Link>
        </>
      )}

      {/* Online Users / Chat — stable expandable panel */}
      <button
        onClick={() => setShowChat((p) => !p)}
        className={`${navCls(location.pathname.startsWith("/community/chat"))} justify-between`}
      >
        <span className="flex items-center gap-3">
          <MessageCircle size={18} />
          <span>Online Users</span>
        </span>
        <span className="flex items-center gap-1.5">
          {onlineUsers.length > 0 && (
            <span className="text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 px-1">
              {onlineUsers.length}
            </span>
          )}
          {showChat ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
        </span>
      </button>

      {/* Pure CSS max-height transition — zero JS layout animation = no jitter */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: showChat ? "350px" : "0px", opacity: showChat ? 1 : 0 }}
      >
        <div className="px-2 pb-2">
          {onlineUsers.length === 0 && (
            <p className="text-[11px] text-white/25 text-center py-3">No one online yet</p>
          )}
          {onlineUsers.slice(0, 8).map((u) => (
            <Link
              key={u.id}
              to="/community/chat"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <div className="relative shrink-0">
                {u.avatar ? (
                  <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={10} className="text-white/40" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5">
                  <OnlineIndicator size="sm" />
                </span>
              </div>
              <span className="text-[11px] text-white/50 truncate">{u.name}</span>
            </Link>
          ))}
          {onlineUsers.length > 8 && (
            <p className="text-[10px] text-white/25 text-center py-1">+{onlineUsers.length - 8} more</p>
          )}
          <Link
            to="/community/chat"
            className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[11px] text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/[0.06] transition-colors border border-white/[0.04]"
          >
            Open Messages →
          </Link>
        </div>
      </div>

      <div className="h-px bg-white/[0.06] my-3 mx-1" />

      <button
        onClick={() => document.getElementById("community-rules")?.scrollIntoView({ behavior: "smooth" })}
        className={navCls(false)}
      >
        <ShieldCheck size={18} /> Guidelines
      </button>

      {/* Repo Points checklist (expandable) */}
      <button
        onClick={() => setShowPoints((p) => !p)}
        className={`${navCls(false)} justify-between`}
      >
        <span className="flex items-center gap-3">
          <Coins size={18} className="text-emerald-400/70" />
          <span>
            Repo Points
            {repoBalance !== null && repoBalance !== undefined && (
              <span className="ml-1.5 text-[10px] font-bold text-emerald-400">{repoBalance}</span>
            )}
          </span>
        </span>
        {showPoints ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
      </button>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: showPoints ? "520px" : "0px", opacity: showPoints ? 1 : 0 }}
      >
        <div className="px-1 pb-3 space-y-2">
          <div>
            <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider px-2 pt-2 pb-1">Earn Repos</p>
            {EARN_POINTS.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-2 py-[3px] rounded hover:bg-white/[0.02]">
                <span className="flex items-center gap-1.5 min-w-0">
                  <item.icon size={10} className={item.color} />
                  <span className="text-[10px] text-white/45 truncate">{item.label}</span>
                </span>
                <span className={`text-[10px] font-bold ${item.color} shrink-0 ml-1`}>{item.pts}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-white/[0.05] mx-2" />
          <div>
            <p className="text-[9px] font-bold text-orange-400 uppercase tracking-wider px-2 pb-1">Spend Repos</p>
            {SPEND_POINTS.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-2 py-[3px] rounded hover:bg-white/[0.02]">
                <span className="flex items-center gap-1.5 min-w-0">
                  <item.icon size={10} className={item.color} />
                  <span className="text-[10px] text-white/45 truncate">{item.label}</span>
                </span>
                <span className={`text-[10px] font-bold ${item.color} shrink-0 ml-1`}>{item.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Power-ups */}
      {user && (
        <>
          <div className="h-px bg-white/[0.06] my-3 mx-1" />
          <p className="px-3 py-1 text-[9px] text-white/25 font-bold uppercase tracking-widest">Power-ups</p>
          <Link to="/community/my-apps" className={navCls(false)}>
            <Pin size={18} className="text-amber-400/70" />
            <span>Pin Post <span className="text-[9px] text-amber-400/60 ml-0.5">25 repos</span></span>
          </Link>
          <Link to="/community/my-apps" className={navCls(false)}>
            <Star size={18} className="text-blue-400/70" />
            <span>Priority <span className="text-[9px] text-blue-400/60 ml-0.5">10 repos</span></span>
          </Link>
          <Link to="/community/my-apps" className={navCls(false)}>
            <Zap size={18} className="text-pink-400/70" />
            <span>Boost <span className="text-[9px] text-pink-400/60 ml-0.5">25 repos</span></span>
          </Link>
        </>
      )}
    </nav>
  );
}
