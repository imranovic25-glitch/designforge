import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, Smartphone, Monitor, Layers, Upload } from "lucide-react";
import { motion } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { useAuth } from "@/src/lib/auth";
import { createSubmission, getMyRepoBalance, isCommunityAdmin, uploadCommunityScreenshot } from "@/src/lib/community-store";
import type { Platform, AppCategory, ListingType } from "@/src/lib/community-types";
import { PLATFORM_LABELS, CATEGORY_LABELS, LISTING_TYPE_LABELS } from "@/src/lib/community-types";

const PLATFORM_ICONS: Record<Platform, typeof Globe> = {
  android: Smartphone,
  ios: Smartphone,
  web: Globe,
  desktop: Monitor,
  "cross-platform": Layers,
};

export function SubmitApp() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const COST_TO_SUBMIT = 15;
  const EARN_PER_FEEDBACK = 5;
  const DEFAULT_TESTER_SLOTS = 20;
  const googleGroupUrl = (import.meta as any).env?.VITE_COMMUNITY_GOOGLE_GROUPS_URL as string | undefined;

  // App details
  const [listingType, setListingType] = useState<ListingType>("app");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [platform, setPlatform] = useState<Platform>("web");
  const [category, setCategory] = useState<AppCategory>("productivity");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [repoBalance, setRepoBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      getMyRepoBalance().then(setRepoBalance);
      isCommunityAdmin().then(setIsAdmin);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 flex justify-center">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

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
    (isAdmin || repoBalance >= COST_TO_SUBMIT) &&
    !submitting &&
    !uploading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);

    // Upload screenshot (optional)
    let finalScreenshotUrl: string | null = screenshotUrl.trim() || null;
    if (screenshotFile) {
      setUploading(true);
      const uploaded = await uploadCommunityScreenshot(screenshotFile);
      setUploading(false);
      if (!uploaded) {
        setSubmitting(false);
        setError("Screenshot upload failed. Try again or submit without it.");
        return;
      }
      finalScreenshotUrl = uploaded;
    }

    const result = await createSubmission({
      title: title.trim(),
      description: description.trim(),
      app_url: appUrl.trim(),
      platform,
      category,
      screenshot_url: finalScreenshotUrl,
      // Repo system: keep these fields present for backwards compatibility
      tier: "free",
      tester_slots: DEFAULT_TESTER_SLOTS,
      payment_status: "none",
      payment_amount_usd: 0,
      user_name: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
      user_avatar: user.user_metadata?.avatar_url ?? null,
    });

    setSubmitting(false);

    if (result) {
      navigate(`/community/app/${result.id}`);
    } else {
      setError(
        repoBalance < COST_TO_SUBMIT
          ? `You need ${COST_TO_SUBMIT} repos to submit. Give feedback on ${Math.ceil(
              (COST_TO_SUBMIT - repoBalance) / EARN_PER_FEEDBACK
            )} apps to earn more.`
          : "Failed to submit. Please try again."
      );
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
              No payments. Earn repos by testing apps, then spend repos to post yours.
            </p>

            <div className="space-y-8">

              {/* Repo summary */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-white/35 uppercase tracking-wider mb-1">Your repos</p>
                    <p className="text-2xl font-bold text-white tabular-nums">{repoBalance}</p>
                    <p className="text-xs text-white/30 mt-2">
                      Earn <strong className="text-white/60">{EARN_PER_FEEDBACK}</strong> repos for your first feedback on an app.
                      Posting costs <strong className="text-white/60">{COST_TO_SUBMIT}</strong> repos.
                    </p>
                    {isAdmin && (
                      <p className="text-xs text-emerald-400/70 mt-2">
                        Admin: posting is unlimited (no repo cost).
                      </p>
                    )}
                  </div>
                  {googleGroupUrl && (
                    <a
                      href={googleGroupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/50 hover:text-white underline"
                    >
                      Join Google Group
                    </a>
                  )}
                </div>
              </div>

              {/* App Details */}
              <div className="border-t border-white/[0.06] pt-8 space-y-5">
                <label className="block text-xs text-white/40 uppercase tracking-wider">
                  App Details
                </label>

                {/* App Name */}
                <div>
                  <label className="block text-xs text-white/30 mb-1.5">App Name</label>
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
                  <label className="block text-xs text-white/30 mb-1.5">App Link</label>
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
                  <label className="block text-xs text-white/30 mb-1.5">Platform</label>
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
                  <label className="block text-xs text-white/30 mb-1.5">Category</label>
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
                  <label className="block text-xs text-white/30 mb-1.5">Description</label>
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
                  <label className="block text-xs text-white/30 mb-1.5">
                    Screenshot <span className="text-white/20">(optional)</span>
                  </label>

                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white/60 hover:bg-white/[0.04] cursor-pointer transition-colors">
                      <Upload size={14} className="text-white/30" />
                      Upload image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)}
                      />
                    </label>

                    <span className="text-xs text-white/30">
                      {screenshotFile ? screenshotFile.name : "or paste a URL below"}
                    </span>
                  </div>

                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://... direct image link (optional)"
                    className="mt-3 w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400/80 bg-red-500/10 px-4 py-2.5 rounded-xl">{error}</p>
              )}

              {!isAdmin && repoBalance < COST_TO_SUBMIT && (
                <div className="text-xs text-amber-400/70 bg-amber-500/[0.06] border border-amber-500/20 px-4 py-3 rounded-xl">
                  You need <strong className="text-amber-300">{COST_TO_SUBMIT}</strong> repos to submit.
                  Earn <strong className="text-amber-300">{EARN_PER_FEEDBACK}</strong> repos for your first feedback on an app.
                  ({Math.max(0, COST_TO_SUBMIT - repoBalance)} more needed)
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white text-black hover:bg-white/90"
              >
                {submitting || uploading ? "Submitting…" : `Submit (costs ${COST_TO_SUBMIT} repos)`}
              </button>

              <p className="text-center text-[11px] text-white/20">
                All submitted links use <code className="text-white/30">rel="nofollow"</code>. Spam gets removed.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default SubmitApp;
