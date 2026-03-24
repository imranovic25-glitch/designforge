import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUp, ExternalLink, Clock, MessageSquare, User, Users, AlertCircle, BarChart2 } from "lucide-react";
import { motion } from "motion/react";
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
} from "@/src/lib/community-store";
import { CATEGORY_LABELS, TIERS } from "@/src/lib/community-types";
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
    if (!app || !user || user.id !== app.user_id) return;
    getSubmissionStats(app.id).then(setStats);
  }, [app?.id, user?.id]);

  const handleUpvote = async () => {
    if (!user || !app) return;
    const result = await toggleUpvote(app.id);
    if (result) {
      setApp({ ...app, upvotes: result.newCount, has_upvoted: result.upvoted });
    }
  };

  const handleFeedbackSubmit = async (data: { rating: number; feedback_text: string; areas: string[]; device_info: string }) => {
    if (!user || !app) return;
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

    if (result) {
      setFeedback((prev) => [result, ...prev.filter((f) => f.user_id !== user.id)]);
      setApp((prev) => prev ? { ...prev, feedback_count: prev.feedback_count + 1 } : prev);
      setShowFeedbackForm(false);
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
  const isOwner = user?.id === app.user_id;
  const isFull = app.slots_filled >= app.tester_slots;
  const isClosed = app.status === "closed";
  const feedbackLocked = isFull || isClosed;

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

            {/* Payment pending banner — owner only */}
            {isOwner && app.payment_status === "pending" && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-300 mb-1.5">
                      Payment pending — {app.tester_slots} slots reserved but inactive
                    </p>
                    <p className="text-xs text-amber-400/70 leading-relaxed">
                      Transfer <strong className="text-amber-400">${app.payment_amount_usd}</strong> via UPI to{" "}
                      <strong className="text-amber-400">designforge360@upi</strong> or contact us at{" "}
                      <strong className="text-amber-400">support@designforge360.in</strong>.{" "}
                      Include <code className="text-amber-300">"{app.title}"</code> in the payment note.
                      Slots activate within 24 hours of confirmation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Slot tracker */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-white/30" />
                  <span className="text-sm text-white/60">Tester slots</span>
                  {app.tier !== "free" && (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-white/30 bg-white/[0.05] border border-white/[0.07] px-1.5 py-0.5 rounded-md">
                      {TIERS.find((t) => t.id === app.tier)?.label ?? app.tier}
                    </span>
                  )}
                </div>
                {isFull ? (
                  <span className="text-xs font-semibold text-amber-400">FULL</span>
                ) : (
                  <span className="text-xs text-white/30">{app.tester_slots - app.slots_filled} remaining</span>
                )}
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                <div
                  style={{ width: `${Math.min(100, (app.slots_filled / app.tester_slots) * 100)}%` }}
                  className={`h-full rounded-full transition-all duration-700 ${isFull ? "bg-amber-400/50" : "bg-emerald-500/60"}`}
                />
              </div>
              <p className="text-xs text-white/25">
                {app.slots_filled} of {app.tester_slots} testers have tried this app
              </p>
            </div>

            {/* Visit App CTA */}
            <a
              href={app.app_url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              onClick={() => trackClick(app.id)}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/90 transition-all mb-12"
            >
              <ExternalLink size={15} />
              Try This App
            </a>

            {/* Feedback Section */}
            <div className="border-t border-white/[0.06] pt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-white/40" />
                  Feedback
                  <span className="text-sm text-white/30 font-normal">({feedback.length})</span>
                </h2>

                {user && !isOwner && !alreadyGaveFeedback && !feedbackLocked && (
                  <button
                    onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                    className="text-sm bg-white/[0.06] hover:bg-white/[0.1] text-white/70 px-4 py-2 rounded-xl border border-white/[0.08] transition-all"
                  >
                    {showFeedbackForm ? "Cancel" : "Give Feedback"}
                  </button>
                )}

                {feedbackLocked && !isOwner && (
                  <span className="text-xs text-amber-400/60">All slots filled</span>
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
                  <FeedbackForm onSubmit={handleFeedbackSubmit} loading={feedbackLoading} />
                </motion.div>
              )}

              {alreadyGaveFeedback && (
                <p className="text-xs text-emerald-400/60 mb-6">You've already given feedback on this app.</p>
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
