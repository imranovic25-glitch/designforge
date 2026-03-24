import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Star, Trash2, ExternalLink, Heart, LogOut, ArrowRight, Wrench } from "lucide-react";
import { useAuth } from "@/src/lib/auth";
import { getReviewsByUser, deleteReview, type Review } from "@/src/lib/reviews";
import { SEOHead } from "@/src/components/seo/SEOHead";

const TOOL_MAP: Record<string, { name: string; path: string }> = {
  "background-remover": { name: "Background Remover", path: "/tools/background-remover" },
  "pdf-compressor": { name: "PDF Compressor", path: "/tools/pdf-compressor" },
  "pdf-merger": { name: "PDF Merger", path: "/tools/pdf-merger" },
  "pdf-to-word": { name: "PDF to Word", path: "/tools/pdf-to-word" },
  "currency-converter": { name: "Currency Converter", path: "/tools/currency-converter" },
  "compound-interest-calculator": { name: "Compound Interest Calculator", path: "/tools/compound-interest-calculator" },
  "loan-emi-calculator": { name: "Loan / EMI Calculator", path: "/tools/loan-emi-calculator" },
  "image-compressor": { name: "Image Compressor", path: "/tools/image-compressor" },
  "image-converter": { name: "Image Converter", path: "/tools/image-converter" },
  "image-resizer": { name: "Image Resizer", path: "/tools/image-resizer" },
  "word-counter": { name: "Word Counter", path: "/tools/word-counter" },
  "json-formatter": { name: "JSON Formatter", path: "/tools/json-formatter" },
  "clipboard-manager": { name: "Clipboard Manager", path: "/tools/clipboard-manager" },
  "word-to-pdf": { name: "Word to PDF", path: "/tools/word-to-pdf" },
  "markdown-preview": { name: "Markdown Preview", path: "/tools/markdown-preview" },
  "qr-code-generator": { name: "QR Code Generator", path: "/tools/qr-code-generator" },
  "color-palette-generator": { name: "Color Palette Generator", path: "/tools/color-palette-generator" },
  "svg-to-png": { name: "SVG to PNG", path: "/tools/svg-to-png" },
  "password-generator": { name: "Password Generator", path: "/tools/password-generator" },
  "mortgage-calculator": { name: "Mortgage Calculator", path: "/tools/mortgage-calculator" },
  "seo-audit": { name: "SEO Audit", path: "/tools/seo-audit" },
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          className={rating >= s ? "fill-amber-400 text-amber-400" : "text-white/15"}
        />
      ))}
    </div>
  );
}

export function Profile() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate("/signin", { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      getReviewsByUser(user.id)
        .then(setReviews)
        .finally(() => setReviewsLoading(false));
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User";
  const avatar = user.user_metadata?.avatar_url ?? null;
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

  return (
    <>
      <SEOHead
        title="My Profile — DesignForge360"
        description="Your DesignForge360 account dashboard."
        canonical="/profile"
        robots="noindex, nofollow"
      />

      <div className="min-h-screen pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">

          {/* Profile header card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-3xl p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6"
          >
            {avatar ? (
              <img
                src={avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full border-2 border-white/10 shrink-0 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center text-3xl font-semibold text-white shrink-0">
                {displayName[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left min-w-0">
              <h1 className="text-2xl font-semibold text-white mb-1 truncate">{displayName}</h1>
              <p className="text-white/40 text-sm mb-1 truncate">{user.email}</p>
              {memberSince && (
                <p className="text-white/25 text-xs">Member since {memberSince}</p>
              )}
            </div>

            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-white/50 hover:text-white hover:border-white/20 transition-colors shrink-0"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: "Tools Reviewed", value: reviews.length.toString() },
              { label: "Avg Rating Given", value: avgRating > 0 ? `${avgRating} / 5` : "—" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="glass-panel rounded-2xl p-6 text-center"
              >
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/30 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Reviews */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">Your Reviews</h2>
              <Link
                to="/tools"
                className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors"
              >
                <Wrench size={12} /> Browse Tools
              </Link>
            </div>

            {reviewsLoading ? (
              <div className="flex justify-center py-14">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-panel rounded-2xl p-10 text-center">
                <p className="text-white/30 text-sm mb-5">
                  You haven't reviewed any tools yet. Try some out and share your experience!
                </p>
                <Link
                  to="/tools"
                  className="inline-flex items-center gap-2 text-sm text-white hover:text-white/70 transition-colors"
                >
                  Explore Tools <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => {
                  const tool = TOOL_MAP[r.tool_slug];
                  return (
                    <div key={r.id} className="glass-panel rounded-2xl p-5 flex gap-4 items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {tool ? (
                            <Link
                              to={tool.path}
                              className="text-sm font-medium text-white hover:text-white/70 transition-colors flex items-center gap-1"
                            >
                              {tool.name}
                              <ExternalLink size={10} className="opacity-30" />
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-white/40">{r.tool_slug}</span>
                          )}
                          <StarRow rating={r.rating} />
                          <span className="text-xs text-white/20">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {r.comment && (
                          <p className="text-sm text-white/45 leading-relaxed">{r.comment}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(r.id)}
                        title="Delete review"
                        className="text-white/15 hover:text-red-400 transition-colors mt-0.5 shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.section>

          {/* Support CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-12 text-center"
          >
            <Link
              to="/support"
              className="inline-flex items-center gap-2 text-sm text-white/25 hover:text-pink-400 transition-colors"
            >
              <Heart size={13} /> Support DesignForge360
            </Link>
          </motion.div>

        </div>
      </div>
    </>
  );
}
