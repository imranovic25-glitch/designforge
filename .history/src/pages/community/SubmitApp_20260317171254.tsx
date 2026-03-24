import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, Smartphone, Monitor, Layers, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { useAuth } from "@/src/lib/auth";
import { createSubmission, getMyRepoBalance, isCommunityAdmin, uploadMultipleScreenshots, serializeScreenshots } from "@/src/lib/community-store";
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
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
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
    (!appUrl.trim() || isValidUrl(appUrl)) &&
    (isAdmin || repoBalance >= COST_TO_SUBMIT) &&
    !submitting &&
    !uploading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);

    // Upload screenshots (required by community guidelines)
    let finalScreenshotUrl: string | null = null;
    if (screenshotFiles.length > 0) {
      setUploading(true);
      const uploaded = await uploadMultipleScreenshots(screenshotFiles);
      setUploading(false);
      if (uploaded.length === 0) {
        setSubmitting(false);
        setError("Screenshot upload failed — please ensure the storage bucket is set up (see community_screenshot_fix.sql), or submit without screenshots.");
        return;
      }
      finalScreenshotUrl = serializeScreenshots(uploaded);
    }

    const result = await createSubmission({
      title: title.trim(),
      description: description.trim(),
      app_url: appUrl.trim() || null,
      listing_type: listingType,
      platform,
      category,
      screenshot_url: finalScreenshotUrl,
      tester_slots: DEFAULT_TESTER_SLOTS,
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
        title="Submit Your App for Testing — Community"
        description="Submit your app to the DesignForge360 community and get honest feedback from real users. Free beta testing for developers and creators."
        canonical="/community/submit"
        robots="noindex, nofollow"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Community", url: "/community" },
          { name: "Submit App", url: "/community/submit" },
        ]}
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

              {/* Listing Details */}
              <div className="border-t border-white/[0.06] pt-8 space-y-5">
                <label className="block text-xs text-white/40 uppercase tracking-wider">
                  Listing Details
                </label>

                {/* Listing Type */}
                <div>
                  <label className="block text-xs text-white/30 mb-1.5">What are you sharing?</label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(LISTING_TYPE_LABELS) as [ListingType, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setListingType(key)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          listingType === key
                            ? "border-white/30 bg-white/10 text-white"
                            : "border-white/[0.08] text-white/35 hover:text-white/60 hover:border-white/15"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs text-white/30 mb-1.5">Name</label>
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
                  <label className="block text-xs text-white/30 mb-1.5">App Link <span className="text-white/20">(optional)</span></label>
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

                {/* Screenshots (optional, up to 3) */}
                <div>
                  <label className="block text-xs text-white/30 mb-1.5">
                    Screenshots <span className="text-white/20">(optional, up to 3)</span>
                  </label>

                  <div className="flex items-center gap-3 flex-wrap mb-3">
                    <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-sm text-white/60 hover:bg-white/[0.04] transition-colors ${
                      screenshotFiles.length >= 3 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                    }`}>
                      <Upload size={14} className="text-white/30" />
                      {screenshotFiles.length >= 3 ? "Max reached" : "Upload images"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        className="hidden"
                        disabled={screenshotFiles.length >= 3}
                        onChange={(e) => {
                          const newFiles = Array.from(e.target.files ?? []);
                          setScreenshotFiles((prev) => [...prev, ...newFiles].slice(0, 3));
                          e.target.value = ""; // reset so same file can be re-selected
                        }}
                      />
                    </label>
                    <span className="text-xs text-white/25">
                      {screenshotFiles.length}/3 selected
                    </span>
                  </div>

                  {/* Previews */}
                  {screenshotFiles.length > 0 && (
                    <div className="flex gap-3 flex-wrap">
                      {screenshotFiles.map((file, i) => (
                        <div key={`${file.name}-${i}`} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-white/[0.08]">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setScreenshotFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white/80 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
