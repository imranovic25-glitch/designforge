import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, TrendingUp, MessageSquare, FolderOpen, Send, Trophy, ShieldCheck, Pin, Zap, Star } from "lucide-react";
import { useAuth } from "@/src/lib/auth";
import type { SortOption } from "@/src/lib/community-types";

interface CommunitySidebarProps {
  sort?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  onResetFilters?: () => void;
}

export function CommunitySidebar({ sort = "newest", onSortChange, onResetFilters }: CommunitySidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
          <Link to="/community/chat" className={navCls(location.pathname === "/community/chat")}>
            <MessageSquare size={18} /> Messages
          </Link>
          <Link to="/community/submit" className={navCls(location.pathname === "/community/submit")}>
            <Send size={18} /> Submit App
          </Link>
          <div className="h-px bg-white/[0.06] my-3 mx-1" />
        </>
      )}

      <button
        onClick={() => document.getElementById("community-rules")?.scrollIntoView({ behavior: "smooth" })}
        className={navCls(false)}
      >
        <ShieldCheck size={18} /> Guidelines
      </button>

      {user && (
        <>
          <div className="h-px bg-white/[0.06] my-3 mx-1" />
          <p className="px-3 py-1 text-[9px] text-white/25 font-bold uppercase tracking-widest">Power-ups</p>
          <Link to="/community/my-apps" className={navCls(false)}>
            <Pin size={18} className="text-amber-400/70" />
            <span>Pin Post <span className="text-[9px] text-amber-400/60 ml-0.5">5 repos</span></span>
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
