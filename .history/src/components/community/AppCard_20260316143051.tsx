import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUp, MessageSquare, ExternalLink, Clock, Users } from "lucide-react";
import type { AppSubmission } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS, TIERS } from "@/src/lib/community-types";
import { PlatformBadge } from "./PlatformBadge";

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface AppCardProps {
  app: AppSubmission;
  onUpvote?: (id: string) => void;
  index?: number;
}

export function AppCard({ app, onUpvote, index = 0 }: AppCardProps) {
  const isNew = Date.now() - new Date(app.created_at).getTime() < 48 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Top Section — Upvote + Content */}
      <div className="flex gap-3 p-4">
        {/* Upvote Button */}
        <button
          onClick={(e) => { e.preventDefault(); onUpvote?.(app.id); }}
          className={`flex flex-col items-center gap-0.5 pt-1 min-w-[40px] rounded-xl px-2 py-2 transition-all duration-200 ${
            app.has_upvoted
              ? "bg-emerald-500/10 text-emerald-400"
              : "text-white/30 hover:text-white/60 hover:bg-white/5"
          }`}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
          <span className="text-xs font-semibold tabular-nums">{app.upvotes}</span>
        </button>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1.5">
            <Link
              to={`/community/app/${app.id}`}
              className="text-[15px] font-medium text-white/90 hover:text-white leading-snug line-clamp-2 transition-colors"
            >
              {app.title}
            </Link>
            {isNew && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-md">
                New
              </span>
            )}
          </div>

          <p className="text-[13px] text-white/40 line-clamp-2 mb-3 leading-relaxed">
            {app.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            <PlatformBadge platform={app.platform} />
            <span className="text-[11px] text-white/25 font-medium uppercase tracking-wider">
              {CATEGORY_LABELS[app.category]}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-white/30">
              <MessageSquare size={12} />
              {app.feedback_count}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-white/25">
              <Clock size={11} />
              {timeAgo(app.created_at)}
            </span>
          </div>
        </div>

        {/* Quick Link */}
        <a
          href={app.app_url}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 self-start mt-1 p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/5 transition-all"
          title="Open app link"
        >
          <ExternalLink size={15} />
        </a>
      </div>

      {/* Author bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/[0.04]">
        {app.user_avatar ? (
          <img src={app.user_avatar} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-4 h-4 rounded-full bg-white/10" />
        )}
        <span className="text-[11px] text-white/30">
          {app.user_name || "Anonymous"}
        </span>
      </div>
    </motion.div>
  );
}
