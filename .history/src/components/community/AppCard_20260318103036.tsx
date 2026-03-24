import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, MessageSquare, ImageIcon, Rocket, Share2, X, Eye, ChevronLeft, ChevronRight, Heart, ThumbsUp, Star } from "lucide-react";
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
  const [loved, setLoved] = useState(false);
  const [loveCount, setLoveCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const [quickRating, setQuickRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        className="group relative"
      >
        {/* Post card */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-blue-500/15 transition-all duration-300">
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
              app.has_upvoted ? "border-orange-500/25 bg-orange-500/[0.08]" : "border-white/[0.1] bg-white/[0.03]"
            }`}>
              <motion.button
                onClick={(e) => { e.preventDefault(); onUpvote?.(app.id); }}
                whileTap={{ scale: 0.8 }}
                className={`p-1.5 rounded-l-full transition-colors ${
                  app.has_upvoted ? "text-orange-400" : "text-white/40 hover:text-orange-400"
                }`}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </motion.button>
              <span className={`text-xs font-bold tabular-nums px-1.5 ${
                app.has_upvoted ? "text-orange-400" : "text-white/50"
              }`}>
                {app.upvotes}
              </span>
            </div>

            {/* Comment */}
            <Link
              to={`/community/app/${app.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
            >
              <MessageSquare size={15} />
              <span>{app.feedback_count}</span>
            </Link>

            {/* Like — with pop animation */}
            <motion.button
              onClick={(e) => { e.preventDefault(); setLiked((p) => !p); setLikeCount((c) => c + (liked ? -1 : 1)); }}
              whileTap={{ scale: 0.85 }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] transition-all ${
                liked ? "text-blue-400 bg-blue-500/15" : "text-white/40 hover:text-blue-400 hover:bg-blue-500/10"
              }`}
            >
              <motion.span
                key={liked ? "liked" : "not-liked"}
                initial={liked ? { scale: 0.5 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="inline-flex"
              >
                <ThumbsUp size={14} className={liked ? "fill-blue-400" : ""} />
              </motion.span>
              {likeCount > 0 && <span className="font-medium">{likeCount}</span>}
            </motion.button>

            {/* Love — with burst animation */}
            <motion.button
              onClick={(e) => { e.preventDefault(); setLoved((p) => !p); setLoveCount((c) => c + (loved ? -1 : 1)); }}
              whileTap={{ scale: 0.85 }}
              className={`relative inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] transition-all ${
                loved ? "text-pink-400 bg-pink-500/15" : "text-white/40 hover:text-pink-400 hover:bg-pink-500/10"
              }`}
            >
              <span className="relative inline-flex">
                <motion.span
                  key={loved ? "loved" : "not-loved"}
                  initial={loved ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 12 }}
                  className="inline-flex"
                >
                  <Heart size={14} className={loved ? "fill-pink-400" : ""} />
                </motion.span>
                {/* Burst ring */}
                <AnimatePresence>
                  {loved && (
                    <motion.span
                      initial={{ scale: 0.3, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full border-2 border-pink-400/60 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </span>
              {loveCount > 0 && <span className="font-medium">{loveCount}</span>}
            </motion.button>

            {/* Quick Rate — inline 5-star feedback */}
            <div className="relative">
              <motion.button
                onClick={(e) => { e.preventDefault(); if (!ratingSubmitted) setShowRating((p) => !p); }}
                whileTap={{ scale: 0.85 }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] transition-all ${
                  ratingSubmitted ? "text-amber-400 bg-amber-500/15" : "text-white/40 hover:text-amber-400 hover:bg-amber-500/10"
                }`}
              >
                <Star size={14} className={ratingSubmitted ? "fill-amber-400" : ""} />
                <span className="hidden sm:inline">{ratingSubmitted ? "Rated" : "Rate"}</span>
                {quickRating > 0 && <span className="font-medium">{quickRating}</span>}
              </motion.button>
              <AnimatePresence>
                {showRating && !ratingSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-0.5 bg-[#111] border border-white/[0.1] rounded-xl px-2.5 py-2 shadow-2xl z-20"
                    onClick={(e) => e.preventDefault()}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setQuickRating(star);
                          setRatingSubmitted(true);
                          setShowRating(false);
                        }}
                        onMouseEnter={() => setHoverStar(star)}
                        onMouseLeave={() => setHoverStar(0)}
                        className="p-0.5 transition-transform hover:scale-125"
                      >
                        <Star
                          size={18}
                          className={`transition-colors ${
                            star <= (hoverStar || quickRating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/20"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[9px] text-amber-400/60 ml-1.5 whitespace-nowrap">+5 repos</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share */}
            <motion.button
              onClick={handleShare}
              whileTap={{ scale: 0.9 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </motion.button>

            {/* Views — at the end */}
            {clickCount !== null && clickCount > 0 && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-white/25">
                <Eye size={12} />
                {clickCount} {clickCount === 1 ? "view" : "views"}
              </span>
            )}
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
                {app.app_url && (
                  <button
                    onClick={handleTryApp}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                  >
                    <Rocket size={14} />
                    Try This App
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
