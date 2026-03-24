import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, Smartphone, Monitor, Layers } from "lucide-react";
import { motion } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { useAuth } from "@/src/lib/auth";
import { createSubmission } from "@/src/lib/community-store";
import type { Platform, AppCategory } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS } from "@/src/lib/community-types";

const PLATFORM_ICONS: Record<Platform, typeof Globe> = {
  android: Smartphone,
  ios: Smartphone,
  web: Globe,
  desktop: Monitor,
  "cross-platform": Layers,
};

export function SubmitApp() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("web");
  const [category, setCategory] = useState<AppCategory>("productivity");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    navigate("/signin");
    return null;
  }

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  };

  const canSubmit =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    isValidUrl(appUrl) &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);

    const result = await createSubmission({
      title: title.trim(),
      description: description.trim(),
      app_url: appUrl.trim(),
      platform,
      category,
      screenshot_url: screenshotUrl.trim() || null,
      user_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      user_avatar: user.user_metadata?.avatar_url ?? null,
    });

    setSubmitting(false);

    if (result) {
      navigate(`/community/app/${result.id}`);
    } else {
      setError("Failed to submit. Please try again.");
    }
  };

  return (
    <>
      <SEOHead
        title="Share Your App — Community"
        description="Submit your app to get feedback from the DesignForge360 community."
        canonical="/community/submit"
        robots="noindex, nofollow"
      />

      <div className="min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">

          {/* Back */}
          <Link to="/community" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to Community
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Share Your App</h1>
            <p className="text-white/40 text-sm mb-10">
              Fill in the basics and you're done. The community will do the rest.
            </p>

            <div className="space-y-6">

              {/* App Name */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="What's your app called?"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* App URL */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  App Link
                </label>
                <input
                  type="url"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="https://your-app.com or Play Store / App Store link"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
                {appUrl && !isValidUrl(appUrl) && (
                  <p className="text-xs text-red-400/70 mt-1">Please enter a valid URL starting with http:// or https://</p>
                )}
              </div>

              {/* Platform */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.entries(PLATFORM_LABELS) as [Platform, string][]).map(([key, label]) => {
                    const Icon = PLATFORM_ICONS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setPlatform(key)}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                          platform === key
                            ? "border-white/25 bg-white/[0.08] text-white"
                            : "border-white/[0.06] text-white/30 hover:text-white/60 hover:border-white/15"
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(CATEGORY_LABELS) as [AppCategory, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        category === key
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="What does your app do? What kind of feedback are you looking for?"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none transition-colors"
                />
                <div className="text-right text-[11px] text-white/20 mt-1">{description.length}/2000</div>
              </div>

              {/* Screenshot URL (optional) */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-2">
                  Screenshot URL <span className="text-white/20">(optional)</span>
                </label>
                <input
                  type="url"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://i.imgur.com/... or any direct image link"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400/80 bg-red-500/10 px-4 py-2.5 rounded-xl">{error}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black hover:bg-white/90"
              >
                {submitting ? "Sharing…" : "Share with Community"}
              </button>

              <p className="text-center text-[11px] text-white/20">
                All submitted links use <code className="text-white/30">rel="nofollow"</code>. Be genuine — spam gets removed.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default SubmitApp;
