import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUp, MessageSquare, ExternalLink, Clock, ImageIcon, Rocket } from "lucide-react";
import type { AppSubmission } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/src/lib/community-types";
import { PlatformBadge } from "./PlatformBadge";
import { trackClick, parseScreenshots } from "@/src/lib/community-store";

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
  const screenshots = parseScreenshots(app.screenshot_url);
  const thumbnail = screenshots[0] ?? null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
    >
      {/* Thumbnail banner */}
      {thumbnail && (
        <Link to={`/community/app/${app.id}`} className="block">
          <div className="relative h-40 overflow-hidden rounded-t-2xl">
            <img
              src={thumbnail}
              alt={`${app.title} preview`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {screenshots.length > 1 && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-md">
                <ImageIcon size={10} />
                {screenshots.length}
              </span>
            )}
          </div>
        </Link>
      )}

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

          <p className="text-[13px] text-white/50 line-clamp-2 mb-3 leading-relaxed">
            {app.description}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {app.listing_type && app.listing_type !== "app" && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded-md">
                {LISTING_TYPE_LABELS[app.listing_type]}
              </span>
            )}
            <PlatformBadge platform={app.platform} />
            <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
              {CATEGORY_LABELS[app.category]}
            </span>
            <span className="flex items-center gap-1 text-[12px] text-white/35">
              <Clock size={11} />
              {timeAgo(app.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar — Reddit style */}
      <div className="flex items-center gap-1 px-4 py-2.5 border-t border-white/[0.04]">
        {/* Author */}
        <div className="flex items-center gap-1.5 mr-auto">
          {app.user_avatar ? (
            <img src={app.user_avatar} alt="" className="w-4 h-4 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-white/10" />
          )}
          <span className="text-[11px] text-white/40">{app.user_name || "Anonymous"}</span>
        </div>

        {/* Comment button */}
        <Link
          to={`/community/app/${app.id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
        >
          <MessageSquare size={14} />
          {app.feedback_count} {app.feedback_count === 1 ? "Comment" : "Comments"}
        </Link>

        {/* Try This App button */}
        <a
          href={app.app_url}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          onClick={(e) => { e.stopPropagation(); trackClick(app.id); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-emerald-400/80 hover:text-emerald-400 bg-emerald-500/[0.07] hover:bg-emerald-500/[0.12] transition-all"
        >
          <Rocket size={13} />
          Try This App
        </a>
      </div>
    </motion.div>
  );
}
