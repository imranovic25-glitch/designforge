import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ExternalLink, Clock, MessageSquare, User, Users, BarChart2, Share2, Flag, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { PlatformBadge } from "@/src/components/community/PlatformBadge";
import { FeedbackForm } from "@/src/components/community/FeedbackForm";
import { FeedbackCard } from "@/src/components/community/FeedbackCard";
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
} from "@/src/lib/community-store";
import { CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/src/lib/community-types";
import type { AppSubmission, AppFeedback } from "@/src/lib/community-types";

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
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [stats, setStats] = useState<{ total_clicks: number; unique_clicks: number } | null>(null);
  const [feedbackError, setFeedbackError] = useState<string>("");
  const [repoToast, setRepoToast] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const googleGroupUrl = (import.meta as any).env?.VITE_COMMUNITY_GOOGLE_GROUPS_URL as string | undefined;

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

    setApp(submission);
    setFeedback(fb);
    setLoading(false);
  }, [id, user]);

  useEffect(() => { load(); }, [load]);

  // Load creator analytics (owner only, after app loads)
  useEffect(() => {
    if (!app) return;
    getSubmissionStats(app.id).then(setStats);
  }, [app?.id]);

  const handleShare = async () => {
    if (!app) return;
    const url = window.location.href;
    const text = `Try ${app.title} (${app.platform}) — ${app.app_url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: app.title, text, url });
        return;
      }
    } catch {
      // user cancelled
      return;
    }

    // Fallback: open WhatsApp share
    const wa = `https://wa.me/?text=${encodeURIComponent(`${app.title}\n${url}\n${app.app_url}`)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const handleUpvote = async () => {
    if (!user || !app) return;
    const result = await toggleUpvote(app.id);
    if (result) {
      setApp({ ...app, upvotes: result.newCount, has_upvoted: result.upvoted });
    }
  };

  const handleFeedbackSubmit = async (data: { rating: number; feedback_text: string; areas: string[]; device_info: string }) => {
    if (!user || !app) return;
    setFeedbackError("");
    setFeedbackLoading(true);

    const result = await submitFeedback({
      submission_id: app.id,
      rating: data.rating,
      feedback_text: data.feedback_text,
      areas: data.areas,
      device_info: data.device_info || null,
      user_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      user_avatar: user.user_metadata?.avatar_url ?? null,
    });

    setFeedbackLoading(false);

    if (result.feedback) {
      setFeedback((prev) => [result.feedback!, ...prev.filter((f) => f.user_id !== user.id)]);
      setShowFeedbackForm(false);

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
        setFeedbackError("Please write a bit more detail (minimum 40 characters) so the feedback is actionable.");
      } else if (/cannot_feedback_own_submission/i.test(msg)) {
        setFeedbackError("You can’t leave feedback on your own app.");
      } else if (/closed/i.test(msg)) {
        setFeedbackError("Feedback is closed for this app.");
      } else {
        setFeedbackError(
          "Something went wrong. Please try again in a moment."
        );
      }
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!app) return;
    const ok = await deleteFeedback(feedbackId, app.id);
    if (ok) {
      setFeedback((prev) => prev.filter((f) => f.id !== feedbackId));
      setApp((prev) => prev ? { ...prev, feedback_count: Math.max(0, prev.feedback_count - 1) } : prev);
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

  const alreadyGaveFeedback = user ? feedback.some((f) => f.user_id === user.id) : false;
  const myFeedback = user ? feedback.find((f) => f.user_id === user.id) : undefined;
  const isOwner = user?.id === app.user_id;
  const isClosed = app.status === "closed";
  const feedbackLocked = isClosed;

  return (
    <>
      <SEOHead
        title={`${app.title} — App Feedback`}
        description={`Community feedback on ${app.title}. ${app.description.slice(0, 120)}`}
        canonical={`/community/app/${app.id}`}
      />

      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-3xl">

          {/* Back */}
          <Link to="/community" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Community
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Screenshot */}
            {app.screenshot_url && (
              <div className="mb-6 rounded-2xl overflow-hidden border border-white/[0.06]">
                <img
                  src={app.screenshot_url}
                  alt={`Screenshot of ${app.title}`}
                  className="w-full max-h-80 object-cover"
                />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{app.title}</h1>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <PlatformBadge platform={app.platform} size="md" />
                  <span className="text-xs text-white/30 uppercase tracking-wider font-medium">
                    {CATEGORY_LABELS[app.category]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/25">
                    <Clock size={12} />
                    {timeAgo(app.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                  {app.user_avatar ? (
                    <img src={app.user_avatar} alt="" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <User size={14} className="text-white/30" />
                  )}
                  <span className="text-sm text-white/40">{app.user_name || "Anonymous"}</span>
                </div>
              </div>

              {/* Upvote */}
              <button
                onClick={handleUpvote}
                disabled={!user}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${
                  app.has_upvoted
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-white/[0.08] text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                <ArrowUp size={18} strokeWidth={2.5} />
                <span className="text-sm font-semibold tabular-nums">{app.upvotes}</span>
              </button>
            </div>

            {/* Description */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4">
              <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">
                {app.description}
              </p>
            </div>

            {/* Members opted (based on unique app-link clicks) */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-white/30" />
                  <span className="text-sm text-white/60">Members opted</span>
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">
                  {stats ? stats.unique_clicks : 0}
                </span>
              </div>
              <p className="text-xs text-white/25 mt-2">
                Counts unique visitors who clicked “Try This App”.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-wrap mb-12">
              <a
                href={app.app_url}
                target="_blank"
                rel="noopener noreferrer nofollow ugc"
                onClick={() => trackClick(app.id)}
                className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/90 transition-all"
              >
                <ExternalLink size={15} />
                Try This App
              </a>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.06] transition-all"
              >
                <Share2 size={15} />
                Share
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${app.title}\n${window.location.href}\n${app.app_url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.02] text-white/60 hover:bg-white/[0.04] transition-all"
              >
                WhatsApp
              </a>

              {googleGroupUrl && (
                <a
                  href={googleGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-white underline"
                >
                  Share in Google Group
                </a>
              )}
            </div>

            {/* Feedback Section */}
            <div className="border-t border-white/[0.06] pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-white/40" />
                  Feedback
                  <span className="text-sm text-white/30 font-normal">({feedback.length})</span>
                </h2>

                {user && !isOwner && !feedbackLocked && (
                  <button
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="text-sm bg-white/[0.06] hover:bg-white/[0.1] text-white/70 px-4 py-2 rounded-xl border border-white/[0.08] transition-all"
                  >
                    {showFeedbackForm ? "Cancel" : alreadyGaveFeedback ? "Edit Your Feedback" : "Give Feedback"}
                  </button>
                )}

                {feedbackLocked && !isOwner && (
                  <span className="text-xs text-amber-400/60">Feedback is closed</span>
                )}

                {user && isOwner && (
                  <span className="text-xs text-white/30">You can’t leave feedback on your own app.</span>
                )}

                {!user && (
                  <Link
                    to="/signin"
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    Sign in to give feedback
                  </Link>
                )}
              </div>

              {/* Feedback Form */}
              {showFeedbackForm && !feedbackLocked && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-8 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
                >
                  <FeedbackForm
                    onSubmit={handleFeedbackSubmit}
                    loading={feedbackLoading}
                    submitLabel={alreadyGaveFeedback ? "Update Feedback" : "Submit Feedback"}
                    initial={
                      myFeedback
                        ? {
                            rating: myFeedback.rating,
                            feedback_text: myFeedback.feedback_text,
                            areas: myFeedback.areas ?? [],
                            device_info: myFeedback.device_info ?? "",
                          }
                        : undefined
                    }
                  />
                </motion.div>
              )}

              {feedbackError && (
                <p className="text-sm text-red-400/80 bg-red-500/10 px-4 py-2.5 rounded-xl mb-6">{feedbackError}</p>
              )}

              {alreadyGaveFeedback && !showFeedbackForm && (
                <p className="text-xs text-emerald-400/60 mb-6">You’ve already given feedback on this app. You can edit it anytime.</p>
              )}

              {/* Feedback List */}
              <div className="space-y-3">
                {feedback.map((fb) => (
                  <FeedbackCard
                    key={fb.id}
                    feedback={fb}
                    currentUserId={user?.id}
                    onDelete={handleDeleteFeedback}
                  />
                ))}

                {feedback.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/25 text-sm">No feedback yet. Be the first to try this app!</p>
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
                      <div className="text-[11px] text-white/30 mt-1">Feedback Rate</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default AppDetail;
