import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, MessageSquare, ImageIcon, Rocket, Share2, X, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { AppSubmission } from "@/src/lib/community-types";
import { CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/src/lib/community-types";
import { PlatformBadge } from "./PlatformBadge";
import { trackClick, parseScreenshots, getSubmissionStats } from "@/src/lib/community-store";

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
  const [currentImg, setCurrentImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [clickCount, setClickCount] = useState<number | null>(null);

  const hasMultiple = screenshots.length > 1;
  const visibleImg = screenshots[currentImg] ?? null;

  // Load click count
  useEffect(() => {
    getSubmissionStats(app.id).then((s) => setClickCount(s.unique_clicks));
  }, [app.id]);

  const handleTryApp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    trackClick(app.id);
    setClickCount((c) => (c ?? 0) + 1);
    window.open(app.app_url, "_blank", "noopener,noreferrer");
  }, [app.id, app.app_url]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/community/app/${app.id}`;
    const text = `Check out ${app.title}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: app.title, text, url });
        return;
      }
    } catch { /* cancelled */ }
    // Fallback: copy to clipboard
    navigator.clipboard?.writeText(url);
  }, [app.id, app.title]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="group relative"
      >
        {/* Post card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.14] transition-all duration-300">
          {/* Author header */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            {app.user_avatar ? (
              <img src={app.user_avatar} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/10" />
            )}
            <span className="text-[12px] text-white/50 font-medium">{app.user_name || "Anonymous"}</span>
            <span className="text-[11px] text-white/25">·</span>
            <span className="text-[11px] text-white/30">{timeAgo(app.created_at)}</span>
            <div className="ml-auto flex items-center gap-2">
              <PlatformBadge platform={app.platform} />
              {app.listing_type && app.listing_type !== "app" && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                  {LISTING_TYPE_LABELS[app.listing_type]}
                </span>
              )}
              {isNew && (
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                  New
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="px-4 pb-1">
            <Link
              to={`/community/app/${app.id}`}
              className="text-[16px] font-semibold text-white/90 hover:text-white leading-snug transition-colors"
            >
              {app.title}
            </Link>
          </div>

          {/* Description text */}
          <div className="px-4 pb-3">
            <p className="text-[13px] text-white/45 line-clamp-2 leading-relaxed">
              {app.description}
            </p>
            <span className="text-[10px] text-white/30 uppercase tracking-wider">{CATEGORY_LABELS[app.category]}</span>
          </div>

          {/* Image carousel — clickable for lightbox */}
          {visibleImg && (
            <div className="relative group/img">
              <button
                onClick={() => setLightbox(true)}
                className="block w-full cursor-pointer"
              >
                <div className="relative overflow-hidden mx-0">
                  <img
                    src={visibleImg}
                    alt={`${app.title} preview`}
                    className="w-full max-h-[480px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  {hasMultiple && (
                    <span className="absolute bottom-2 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white/80 text-[10px] font-medium px-2 py-0.5 rounded-md">
                      <ImageIcon size={10} />
                      {currentImg + 1}/{screenshots.length}
                    </span>
                  )}
                </div>
              </button>
              {/* Prev / Next arrows */}
              {hasMultiple && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImg((p) => (p - 1 + screenshots.length) % screenshots.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:bg-black/80 hover:text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImg((p) => (p + 1) % screenshots.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:bg-black/80 hover:text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ═══ Reddit-style action bar ═══ */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-white/[0.06]">
            {/* Upvote / count */}
            <div className={`inline-flex items-center rounded-full border transition-all ${
              app.has_upvoted ? "border-emerald-500/20 bg-emerald-500/[0.06]" : "border-white/[0.08] bg-white/[0.02]"
            }`}>
              <button
                onClick={(e) => { e.preventDefault(); onUpvote?.(app.id); }}
                className={`p-1.5 rounded-l-full transition-colors ${
                  app.has_upvoted ? "text-emerald-400" : "text-white/35 hover:text-emerald-400"
                }`}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
              <span className={`text-xs font-semibold tabular-nums px-1.5 ${
                app.has_upvoted ? "text-emerald-400" : "text-white/50"
              }`}>
                {app.upvotes}
              </span>
            </div>

            {/* Comment */}
            <Link
              to={`/community/app/${app.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all"
            >
              <MessageSquare size={15} />
              <span>{app.feedback_count}</span>
            </Link>

            {/* Share */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/35 hover:text-white/60 hover:bg-white/[0.05] transition-all"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Try This App — at the end */}
            <button
              onClick={handleTryApp}
              className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium text-emerald-400/80 hover:text-emerald-400 bg-emerald-500/[0.07] hover:bg-emerald-500/[0.12] border border-emerald-500/[0.12] transition-all"
            >
              <Rocket size={13} />
              Try App
              {clickCount !== null && clickCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-emerald-400/60 ml-0.5">
                  <Eye size={10} />
                  {clickCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ═══ Full-screen Image Lightbox with carousel ═══ */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setLightbox(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all z-10"
            >
              <X size={20} />
            </button>

            {/* Image area with prev/next */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {hasMultiple && (
                <button
                  onClick={() => setCurrentImg((p) => (p - 1 + screenshots.length) % screenshots.length)}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center z-10"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              <img
                src={screenshots[currentImg]}
                alt={`${app.title} full view`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {hasMultiple && (
                <button
                  onClick={() => setCurrentImg((p) => (p + 1) % screenshots.length)}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center z-10"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </motion.div>

            {/* Dots indicator */}
            {hasMultiple && (
              <div className="flex items-center gap-1.5 mt-3" onClick={(e) => e.stopPropagation()}>
                {screenshots.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImg(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentImg ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"}`}
                  />
                ))}
              </div>
            )}

            {/* Bottom text overlay */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-lg mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-lg mb-1">{app.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed line-clamp-3">{app.description}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <Link
                  to={`/community/app/${app.id}`}
                  className="text-xs text-white/40 hover:text-white/70 underline transition-colors"
                  onClick={() => setLightbox(false)}
                >
                  View Post
                </Link>
                <button
                  onClick={handleTryApp}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                >
                  <Rocket size={14} />
                  Try This App
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
