import { Link, useLocation } from "react-router-dom";
import { Home, TrendingUp, MessageSquare, FolderOpen, Send, Trophy, ShieldCheck } from "lucide-react";
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

  const isHome = sort === "newest";
  const isPopular = sort === "most-upvoted";
  const isTopReviewed = sort === "most-feedback";

  const navCls = (active: boolean, color?: string) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
      active
        ? color === "orange"
          ? "bg-gradient-to-r from-orange-500/15 to-orange-500/5 text-orange-400"
          : color === "amber"
            ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-400"
            : "bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-400"
        : "text-white/55 hover:bg-white/[0.06] hover:text-white/85"
    }`;

  return (
    <nav className="py-3 px-2 space-y-0.5">
      <button onClick={() => { onResetFilters?.(); onSortChange?.("newest"); }} className={navCls(isHome)}>
        <Home size={18} /> Home
      </button>
      <button onClick={() => onSortChange?.("most-upvoted")} className={navCls(isPopular, "orange")}>
        <TrendingUp size={18} /> Popular
      </button>
      <button onClick={() => onSortChange?.("most-feedback")} className={navCls(isTopReviewed, "amber")}>
        <Trophy size={18} /> Top Reviewed
      </button>

      <div className="h-px bg-gradient-to-r from-white/[0.08] to-transparent my-3 mx-1" />

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
          <div className="h-px bg-gradient-to-r from-white/[0.08] to-transparent my-3 mx-1" />
        </>
      )}

      <button
        onClick={() => document.getElementById("community-rules")?.scrollIntoView({ behavior: "smooth" })}
        className={navCls(false)}
      >
        <ShieldCheck size={18} /> Guidelines
      </button>
    </nav>
  );
}
