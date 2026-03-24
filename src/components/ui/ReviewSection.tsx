import { useState, useEffect, useCallback } from "react";
import { Star, Trash2, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/lib/auth";
import {
  getReviews,
  submitReview,
  deleteReview,
  type Review,
  type ReviewStats,
  getReviewStats,
} from "@/src/lib/reviews";

/* ── Star picker ── */
function StarPicker({ value, onChange, size = 20, readonly = false }: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            size={size}
            className={
              (hover || value) >= star
                ? "fill-amber-400 text-amber-400"
                : "text-white/15"
            }
          />
        </button>
      ))}
    </div>
  );
}

/* ── Single review card ── */
function ReviewCard({ review, onDelete, isOwner }: {
  review: Review;
  onDelete: (id: string) => void;
  isOwner: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-panel rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {review.user_avatar ? (
            <img
              src={review.user_avatar}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-medium">
              {review.user_name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-white">{review.user_name || "Anonymous"}</div>
            <div className="text-xs text-white/30">
              {new Date(review.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarPicker value={review.rating} readonly size={14} />
          {isOwner && (
            <button
              onClick={() => onDelete(review.id)}
              className="text-white/20 hover:text-red-400 transition-colors ml-1"
              title="Delete your review"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {review.comment && (
        <p className="mt-3 text-sm text-white/60 leading-relaxed">{review.comment}</p>
      )}
    </motion.div>
  );
}

/* ── Main ReviewSection ── */
export function ReviewSection({ toolSlug }: { toolSlug: string }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ average: 0, count: 0 });
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [r, s] = await Promise.all([getReviews(toolSlug), getReviewStats(toolSlug)]);
    setReviews(r);
    setStats(s);
    // Pre-fill if user already left a review
    if (user) {
      const existing = r.find((rev) => rev.user_id === user.id);
      if (existing) {
        setRating(existing.rating);
        setComment(existing.comment);
      }
    }
  }, [toolSlug, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (rating === 0) { setError("Please select a star rating."); return; }
    setError(null);
    setSubmitting(true);

    const userName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "User";
    const avatar = user.user_metadata?.avatar_url ?? null;

    const { error: err } = await submitReview(toolSlug, rating, comment, userName, avatar);
    if (err) {
      setError(err);
    } else {
      await load();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await deleteReview(id);
    if (!err) {
      setRating(0);
      setComment("");
      await load();
    }
  };

  return (
    <div className="mt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white tracking-tight">User Reviews</h2>
          {stats.count > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarPicker value={Math.round(stats.average)} readonly size={16} />
              <span className="text-sm text-white/50">
                {stats.average} out of 5 ({stats.count} {stats.count === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Write review */}
      {user ? (
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-sm font-medium">
                {(user.user_metadata?.full_name ?? user.email)?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <span className="text-sm text-white/60">
              {user.user_metadata?.full_name ?? user.email?.split("@")[0]}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-white/40">Your rating:</span>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write an optional review..."
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/25 p-4 text-sm outline-none focus:border-white/20 resize-none transition-colors mb-4"
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-red-300 text-sm mb-4">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 disabled:opacity-40 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="glass-panel rounded-2xl p-6 mb-8 text-center">
          <p className="text-white/50 text-sm mb-4">Sign in to leave a review</p>
          <Link
            to="/signin"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-xl hover:bg-white/90 transition-colors"
          >
            <LogIn size={16} /> Sign In
          </Link>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {reviews.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onDelete={handleDelete}
              isOwner={r.user_id === user?.id}
            />
          ))}
        </AnimatePresence>
        {reviews.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No reviews yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
