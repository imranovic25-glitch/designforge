import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ExternalLink, Clock, MessageSquare, User, Eye, BarChart2, Share2, Flag, MessageCircle, X, ChevronLeft, ChevronRight, LinkIcon, Send, Heart, ThumbsUp, Paperclip, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { PlatformBadge } from "@/src/components/community/PlatformBadge";
import { FeedbackCard } from "@/src/components/community/FeedbackCard";
import { CommunitySidebar } from "@/src/components/community/CommunitySidebar";
import { MilestoneNotification } from "@/src/components/community/MilestoneNotification";
import { useAuth } from "@/src/lib/auth";
import {
  getSubmissionById,
  getFeedback,
  submitFeedback,
  deleteFeedback,
  toggleUpvote,
  getUserUpvotes,
  trackClick,
  getSubmissionStats,
  reportSubmission,
  rewardCommunityAction,
  parseScreenshots,
  getReplies,
  submitReply,
  deleteReply,
  uploadCommunityScreenshot,
} from "@/src/lib/community-store";
import { CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/src/lib/community-types";
import type { AppSubmission, AppFeedback, FeedbackReply } from "@/src/lib/community-types";
import { generateAppContent } from "@/src/lib/seo-content";

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

export function AppDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [app, setApp] = useState<AppSubmission | null>(null);
  const [feedback, setFeedback] = useState<AppFeedback[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<string, FeedbackReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [stats, setStats] = useState<{ total_clicks: number; unique_clicks: number } | null>(null);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [repoToast, setRepoToast] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [loveCounts, setLoveCounts] = useState<Record<string, number>>({});
  const [lovedSet, setLovedSet] = useState<Set<string>>(new Set());
  const [liked, setLiked] = useState(false);
  const [loved, setLoved] = useState(false);
  const [commentFiles, setCommentFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [submission, fb] = await Promise.all([
      getSubmissionById(id),
      getFeedback(id),
    ]);

    if (submission && user) {
      const upvoted = await getUserUpvotes(user.id, [submission.id]);
      submission.has_upvoted = upvoted.has(submission.id);
    }

    // Load replies for all feedback
    if (fb.length > 0) {
      const replies = await getReplies(fb.map((f) => f.id));
      setRepliesMap(replies);
    }

    setApp(submission);
    setFeedback(fb);
    setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  // Load creator analytics (owner only, after app loads)
  useEffect(() => {
    if (!app) return;
    trackClick(app.id); // track page view
    getSubmissionStats(app.id).then(setStats);
  }, [app?.id]);

  const handleShare = async () => {
    if (!app) return;
    const url = window.location.href;
    const text = `Check out ${app.title}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: app.title, text, url });
      } else {
        navigator.clipboard?.writeText(url);
      }
    } catch {
      // user cancelled
      return;
    }

    // Award 2 repos for sharing
    if (user) {
      const reward = await rewardCommunityAction(app.id, "share");
      if (reward.awarded > 0) {
        setRepoToast(`+${reward.awarded} repos earned for sharing! Balance: ${reward.new_balance}`);
        setTimeout(() => setRepoToast(""), 5000);
      }
    }
  };

  const handleUpvote = async () => {
    if (!user || !app) return;
    const result = await toggleUpvote(app.id);
    if (result) {
      setApp({ ...app, upvotes: result.newCount, has_upvoted: result.upvoted });
      if (result.upvoted) {
        const reward = await rewardCommunityAction(app.id, "upvote");
        if (reward.awarded > 0) {
          setRepoToast(`+${reward.awarded} repo earned! Balance: ${reward.new_balance}`);
          setTimeout(() => setRepoToast(""), 5000);
        }
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !app || !commentText.trim()) return;
    if (commentText.trim().length < 40) {
      setFeedbackError("Please write at least 40 characters so the comment is helpful.");
      return;
    }
    setFeedbackError("");

    // Upload attached images first
    let imageUrls: string[] = [];
    if (commentFiles.length > 0) {
      setUploadingImages(true);
      for (const file of commentFiles) {
        const url = await uploadCommunityScreenshot(file);
        if (url) imageUrls.push(url);
      }
      setUploadingImages(false);
    }

    setFeedbackLoading(true);

    const result = await submitFeedback({
      submission_id: app.id,
      rating: 5,
      feedback_text: commentText.trim(),
      areas: imageUrls,
      device_info: null,
      user_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      user_avatar: user.user_metadata?.avatar_url ?? null,
    });

    setFeedbackLoading(false);

    if (result.feedback) {
      setFeedback((prev) => [result.feedback!, ...prev.filter((f) => f.user_id !== user.id)]);
      setCommentText("");
      setCommentFiles([]);

      // Show repos earned toast
      if (result.awarded > 0) {
        setRepoToast(`+${result.awarded} repos earned! Balance: ${result.new_balance}`);
        setTimeout(() => setRepoToast(""), 5000);
      }

      // Refresh submission to reflect slot fill / auto-close
      const updated = await getSubmissionById(app.id);
      if (updated) {
        // Preserve viewer upvote state
        updated.has_upvoted = app.has_upvoted;
        setApp(updated);
      }
    } else {
      const msg = result.error ?? "";
      if (/feedback_too_short/i.test(msg)) {
        setFeedbackError("Please write at least 40 characters.");
      } else if (/cannot_feedback_own_submission/i.test(msg)) {
        setFeedbackError("You can't comment on your own app.");
      } else if (/closed/i.test(msg)) {
        setFeedbackError("Comments are closed for this app.");
      } else {
        setFeedbackError("Something went wrong. Please try again.");
      }
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!app) return;
    const ok = await deleteFeedback(feedbackId, app.id);
    if (ok) {
      setFeedback((prev) => prev.filter((f) => f.id !== feedbackId));
      setRepliesMap((prev) => { const next = { ...prev }; delete next[feedbackId]; return next; });
      setApp((prev) => prev ? { ...prev, feedback_count: Math.max(0, prev.feedback_count - 1) } : prev);
    }
  };

  const handleReply = async (feedbackId: string, text: string) => {
    if (!user) return;
    const result = await submitReply({
      feedback_id: feedbackId,
      reply_text: text,
      user_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      user_avatar: user.user_metadata?.avatar_url ?? null,
    });
    if (result.reply) {
      setRepliesMap((prev) => ({
        ...prev,
        [feedbackId]: [...(prev[feedbackId] ?? []), result.reply!],
      }));
      if (result.awarded > 0) {
        setRepoToast(`+${result.awarded} repos earned! Balance: ${result.new_balance}`);
        setTimeout(() => setRepoToast(""), 5000);
      }
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    const ok = await deleteReply(replyId);
    if (ok) {
      setRepliesMap((prev) => {
        const next: Record<string, FeedbackReply[]> = {};
        for (const [fid, replies] of Object.entries(prev)) {
          next[fid] = replies.filter((r) => r.id !== replyId);
        }
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl text-center">
          <p className="text-white/40 text-lg mb-4">App not found</p>
          <Link to="/community" className="text-sm text-white/50 hover:text-white underline">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const alreadyCommented = user ? feedback.some((f) => f.user_id === user.id) : false;
  const isOwner = user?.id === app.user_id;
  const isClosed = app.status === "closed";
  const feedbackLocked = isClosed;

  // Love handler
  const handleLove = async (feedbackId: string) => {
    if (!user) return;
    const alreadyLoved = lovedSet.has(feedbackId);
    setLovedSet((prev) => {
      const next = new Set(prev);
      if (alreadyLoved) next.delete(feedbackId); else next.add(feedbackId);
      return next;
    });
    setLoveCounts((prev) => ({
      ...prev,
      [feedbackId]: (prev[feedbackId] ?? 0) + (alreadyLoved ? -1 : 1),
    }));
  };

  const handleReport = async () => {
    if (!reportReason.trim() || !app) return;
    const ok = await reportSubmission(app.id, reportReason.trim());
    if (ok) {
      setReportSent(true);
      setShowReportModal(false);
      setReportReason("");
      // Award 1 repo for reporting
      const reward = await rewardCommunityAction(app.id, "report");
      if (reward.awarded > 0) {
        setRepoToast(`+${reward.awarded} repo earned for reporting! Balance: ${reward.new_balance}`);
        setTimeout(() => setRepoToast(""), 5000);
      }
    }
  };

  const handlePostLike = async () => {
    if (!user || !app) return;
    setLiked(!liked);
    if (!liked) {
      const reward = await rewardCommunityAction(app.id, "like");
      if (reward.awarded > 0) {
        setRepoToast(`+${reward.awarded} repo earned! Balance: ${reward.new_balance}`);
        setTimeout(() => setRepoToast(""), 5000);
      }
    }
  };

  const handlePostLove = async () => {
    if (!user || !app) return;
    setLoved(!loved);
    if (!loved) {
      const reward = await rewardCommunityAction(app.id, "love");
      if (reward.awarded > 0) {
        setRepoToast(`+${reward.awarded} repo earned! Balance: ${reward.new_balance}`);
        setTimeout(() => setRepoToast(""), 5000);
      }
    }
  };

  return (
    <>
      <SEOHead
        title={seoContent.seoTitle}
        description={seoContent.seoDescription}
        canonical={`/community/app/${app.id}`}
        ogType="article"
        schema="Article"
        articlePublishedTime={app.created_at}
        articleModifiedTime={app.updated_at}
        articleAuthor={app.user_name || "Community Member"}
        articleSection="App Reviews"
        faqItems={seoContent.faq}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          { name: app.title, url: `/community/app/${app.id}` },
        ]}
        {...(feedback.length >= 3 && {
          aggregateRating: {
            appName: app.title,
            appUrl: app.app_url || `/community/app/${app.id}`,
            ratingValue: parseFloat(
              Math.max(3.0, Math.min(5.0, 3.5 + Math.min(app.upvotes || 0, 30) / 30 * 1.5)).toFixed(1)
            ),
            ratingCount: feedback.length,
          },
        })}
      />

      <div className="min-h-screen pt-28 pb-20">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1200px]">

          <div className="flex gap-6">
            {/* ═══════ Left Sidebar ═══════ */}
            <CommunitySidebar />

            {/* ═══════ Main Content ═══════ */}
            <main className="flex-1 min-w-0">
              {/* Back */}
              <Link to="/community" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-6 transition-colors">
                <ArrowLeft size={16} />
                Community
              </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ═══════ Reddit-style Post Card ═══════ */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-6">
              {/* Author line */}
              <div className="flex items-center gap-2 px-5 pt-4 pb-2 flex-wrap">
                {app.user_avatar ? (
                  <img src={app.user_avatar} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={12} className="text-white/40" />
                  </div>
                )}
                <span className="text-sm text-white/50 font-medium">{app.user_name || "Anonymous"}</span>
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/30">{timeAgo(app.created_at)}</span>
                <span className="text-xs text-white/20">·</span>
                <PlatformBadge platform={app.platform} size="md" />
                {app.listing_type && app.listing_type !== "app" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md">
                    {LISTING_TYPE_LABELS[app.listing_type]}
                  </span>
                )}
                <span className="text-xs text-white/20">·</span>
                <span className="text-xs text-white/30 uppercase tracking-wider font-medium">
                  {CATEGORY_LABELS[app.category]}
                </span>
                {user && !isOwner && (
                  <Link
                    to={`/community/chat?with=${app.user_id}`}
                    className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white/60 ml-auto transition-colors"
                  >
                    <MessageCircle size={12} />
                    Message
                  </Link>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl md:text-2xl font-bold text-white px-5 pb-3">{app.title}</h1>

              {/* Description */}
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap px-5 pb-4">
                {app.description}
              </p>

              {/* Screenshots */}
              {(() => {
                const screenshots = parseScreenshots(app.screenshot_url);
                if (screenshots.length === 0) return null;
                const hasMultiple = screenshots.length > 1;
                return (
                  <div className="relative group/img border-t border-b border-white/[0.06] bg-black/20">
                    <button
                      onClick={() => { setLightboxIdx(lightboxIdx); setLightboxImg(screenshots[lightboxIdx]); }}
                      className="block w-full cursor-pointer"
                    >
                      <img
                        src={screenshots[lightboxIdx]}
                        alt={`Screenshot ${lightboxIdx + 1} of ${app.title}`}
                        className="w-full max-h-[500px] object-contain"
                      />
                    </button>
                    {hasMultiple && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => (p - 1 + screenshots.length) % screenshots.length); }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:bg-black/80 hover:text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => (p + 1) % screenshots.length); }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:bg-black/80 hover:text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                          {screenshots.map((_, i) => (
                            <button
                              key={i}
                              onClick={(e) => { e.stopPropagation(); setLightboxIdx(i); }}
                              className={`w-2 h-2 rounded-full transition-all ${i === lightboxIdx ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* App URL */}
              {app.app_url && (
                <div className="flex items-center gap-3 px-5 pt-4">
                  <LinkIcon size={14} className="text-white/30 shrink-0" />
                  <a
                    href={app.app_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    onClick={() => trackClick(app.id)}
                    className="text-sm text-blue-400 hover:text-blue-300 truncate transition-colors"
                  >
                    {app.app_url}
                  </a>
                </div>
              )}

              {/* Reddit-style Action Bar */}
              <div className="flex items-center gap-1 px-3 py-2 mt-2 border-t border-white/[0.06]">
                <button
                  onClick={handleUpvote}
                  disabled={!user}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    app.has_upvoted
                      ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <ArrowUp size={15} strokeWidth={2.5} />
                  <span className="tabular-nums">{app.upvotes}</span>
                </button>

                <button
                  onClick={() => commentRef.current?.focus()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                  <MessageSquare size={15} />
                  <span className="tabular-nums">{feedback.length}</span>
                </button>

                <button
                  onClick={handlePostLike}
                  disabled={!user}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    liked
                      ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/15"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <ThumbsUp size={15} />
                </button>

                <button
                  onClick={handlePostLove}
                  disabled={!user}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    loved
                      ? "text-pink-400 bg-pink-500/10 hover:bg-pink-500/15"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  <Heart size={15} />
                </button>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                  <Share2 size={15} />
                </button>

                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/30">
                  <Eye size={15} />
                  <span className="tabular-nums">{stats ? stats.unique_clicks : 0}</span>
                </span>

                <span className="flex-1" />

                {app.app_url && (
                  <a
                    href={app.app_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow ugc"
                    onClick={() => trackClick(app.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-black hover:bg-white/90 transition-all"
                  >
                    <ExternalLink size={13} />
                    Try App
                  </a>
                )}

                {user && !isOwner && !reportSent && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Flag size={13} />
                  </button>
                )}
                {reportSent && (
                  <span className="text-[11px] text-white/25 px-2">Reported</span>
                )}
              </div>
            </div>

            {/* Milestone notification — owner only */}
            {isOwner && stats && (
              <MilestoneNotification
                submissionId={app.id}
                views={stats.unique_clicks}
                upvotes={app.upvotes}
                comments={feedback.length}
              />
            )}

            {/* Repos earned toast */}
            <AnimatePresence>
              {repoToast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 text-center text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl"
                >
                  {repoToast}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Report modal */}
            <AnimatePresence>
              {showReportModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowReportModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm mx-4 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-white">Report this listing</h3>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Why are you reporting this? (spam, inappropriate, etc.)"
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/25 resize-none"
                    />
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowReportModal(false)}
                        className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReport}
                        disabled={!reportReason.trim()}
                        className="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors disabled:opacity-30"
                      >
                        Submit Report
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══════ Rich SEO Content Sections ═══════ */}
            <div className="space-y-8 mb-8">
              {/* Intro */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">About {app.title}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{seoContent.intro}</p>
              </section>

              {/* What it does */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">What {app.title} Does</h2>
                <p className="text-sm text-white/50 leading-relaxed">{seoContent.whatItDoes}</p>
              </section>

              {/* Who should use */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">Who Should Use {app.title}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{seoContent.whoShouldUse}</p>
              </section>

              {/* How to test */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">How to Test {app.title}</h2>
                <p className="text-sm text-white/50 leading-relaxed">{seoContent.howToTest}</p>
              </section>

              {/* Why it needs testers */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">Why {app.title} Needs Beta Testers</h2>
                <p className="text-sm text-white/50 leading-relaxed">{seoContent.whyNeedsTesters}</p>
              </section>

              {/* Feedback summary */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">User Feedback Summary</h2>
                <p className="text-sm text-white/50 leading-relaxed">{seoContent.feedbackSummary}</p>
              </section>

              {/* Pros & Cons */}
              <section>
                <h2 className="text-base font-semibold text-white mb-2">Pros & Cons</h2>
                <p className="text-xs text-white/30 mb-3">{seoContent.prosAndCons.intro}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">Pros</h3>
                    <ul className="space-y-1.5">
                      {seoContent.prosAndCons.pros.map((p, i) => (
                        <li key={i} className="text-sm text-white/50 flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">+</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Cons</h3>
                    <ul className="space-y-1.5">
                      {seoContent.prosAndCons.cons.map((c, i) => (
                        <li key={i} className="text-sm text-white/50 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">−</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              {/* FAQ */}
              <section>
                <h2 className="text-base font-semibold text-white mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {seoContent.faq.map((item, i) => (
                    <div key={i}>
                      <h3 className="text-sm font-medium text-white/80 mb-1">{item.question}</h3>
                      <p className="text-sm text-white/40 leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Internal Links */}
              <section>
                <h2 className="text-xs font-medium text-white/30 uppercase tracking-widest mb-3">Explore More</h2>
                <div className="flex flex-wrap gap-2">
                  {seoContent.internalLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:border-white/25 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Comments Section */}
            <div className="border-t border-white/[0.06] pt-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <MessageSquare size={18} className="text-white/40" />
                Comments
                <span className="text-sm text-white/30 font-normal">({feedback.length})</span>
              </h2>

              {/* Always-visible comment box */}
              {user && !isOwner && !feedbackLocked && !alreadyCommented && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(); }}
                  className="mb-6 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
                    if (files.length > 0) setCommentFiles((prev) => [...prev, ...files].slice(0, 4));
                  }}
                >
                  <textarea
                    ref={commentRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Write a comment… (drag & drop images here)"
                    className="w-full bg-transparent text-sm text-white/80 placeholder:text-white/30 focus:outline-none resize-none"
                  />

                  {/* Image previews */}
                  {commentFiles.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {commentFiles.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setCommentFiles((prev) => prev.filter((_, j) => j !== i))}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-white/30 hover:text-white/60 transition-colors"
                        title="Attach images"
                      >
                        <Paperclip size={16} />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []);
                          if (files.length > 0) setCommentFiles((prev) => [...prev, ...files].slice(0, 4));
                          e.target.value = "";
                        }}
                      />
                      <span className="text-[11px] text-white/25">{commentText.length}/2000</span>
                    </div>
                    <button
                      type="submit"
                      disabled={feedbackLoading || uploadingImages || commentText.trim().length < 40}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Send size={14} />
                      {uploadingImages ? "Uploading…" : feedbackLoading ? "Posting…" : "Comment"}
                    </button>
                  </div>
                </form>
              )}

              {feedbackLocked && !isOwner && (
                <p className="text-xs text-amber-400/60 mb-6">Comments are closed</p>
              )}

              {user && isOwner && (
                <p className="text-xs text-white/30 mb-6">You can’t comment on your own app.</p>
              )}

              {!user && (
                <Link
                  to="/signin"
                  className="block text-sm text-white/40 hover:text-white/70 transition-colors mb-6"
                >
                  Sign in to comment
                </Link>
              )}

              {feedbackError && (
                <p className="text-sm text-red-400/80 bg-red-500/10 px-4 py-2.5 rounded-xl mb-6">{feedbackError}</p>
              )}

              {alreadyCommented && (
                <p className="text-xs text-emerald-400/60 mb-6">Your comment has been posted.</p>
              )}

              {/* Comments List */}
              <div className="space-y-3">
                {feedback.map((fb) => (
                  <FeedbackCard
                    key={fb.id}
                    feedback={fb}
                    currentUserId={user?.id}
                    onDelete={handleDeleteFeedback}
                    replies={repliesMap[fb.id] ?? []}
                    onReply={user ? handleReply : undefined}
                    onDeleteReply={handleDeleteReply}
                    loveCount={loveCounts[fb.id] ?? 0}
                    hasLoved={lovedSet.has(fb.id)}
                    onLove={user ? handleLove : undefined}
                  />
                ))}

                {feedback.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/35 text-sm">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>

              {/* Creator analytics — owner only */}
              {isOwner && stats !== null && (
                <div className="mt-8 rounded-xl border border-white/[0.07] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <BarChart2 size={15} className="text-white/30" />
                    <h3 className="text-sm font-medium text-white/50">Your App Analytics</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white tabular-nums">{stats.total_clicks}</div>
                      <div className="text-[11px] text-white/30 mt-1">Total Clicks</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white tabular-nums">{stats.unique_clicks}</div>
                      <div className="text-[11px] text-white/30 mt-1">Unique Visitors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white tabular-nums">
                        {stats.unique_clicks > 0
                          ? `${Math.round((app.feedback_count / stats.unique_clicks) * 100)}%`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-white/30 mt-1">Comment Rate</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
        </div>
        </div>
      </div>

      {/* Full-screen image lightbox with carousel */}
      <AnimatePresence>
        {lightboxImg && app && (() => {
          const screenshots = parseScreenshots(app.screenshot_url);
          const hasMultiple = screenshots.length > 1;
          return (
            <motion.div
              key="lightbox"
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setLightboxImg(null)}
            >
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all z-10"
                onClick={() => setLightboxImg(null)}
              >
                <X size={22} />
              </button>
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
                    onClick={() => { const prev = (lightboxIdx - 1 + screenshots.length) % screenshots.length; setLightboxIdx(prev); setLightboxImg(screenshots[prev]); }}
                    className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center z-10"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}
                <img
                  src={screenshots[lightboxIdx] ?? lightboxImg}
                  alt="Screenshot preview"
                  className="max-w-full max-h-[80vh] rounded-lg object-contain"
                />
                {hasMultiple && (
                  <button
                    onClick={() => { const next = (lightboxIdx + 1) % screenshots.length; setLightboxIdx(next); setLightboxImg(screenshots[next]); }}
                    className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white flex items-center justify-center z-10"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </motion.div>
              {hasMultiple && (
                <div className="flex items-center gap-1.5 mt-3" onClick={(e) => e.stopPropagation()}>
                  {screenshots.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setLightboxIdx(i); setLightboxImg(screenshots[i]); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === lightboxIdx ? "bg-white scale-125" : "bg-white/30 hover:bg-white/50"}`}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
}

export default AppDetail;
