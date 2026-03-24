import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, Smartphone, Monitor, Layers, Check, Clock, Users, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SEOHead } from "@/src/components/seo/SEOHead";
import { useAuth } from "@/src/lib/auth";
import { createSubmission } from "@/src/lib/community-store";
import type { Platform, AppCategory, SubmissionTier } from "@/src/lib/community-types";
import {
  PLATFORM_LABELS,
  CATEGORY_LABELS,
  TIERS,
  CUSTOM_MIN_USD,
  CUSTOM_MAX_USD,
  CUSTOM_SLOTS_PER_DOLLAR,
  slotsForCustomAmount,
} from "@/src/lib/community-types";

const PLATFORM_ICONS: Record<Platform, typeof Globe> = {
  android: Smartphone,
  ios: Smartphone,
  web: Globe,
  desktop: Monitor,
  "cross-platform": Layers,
};

const TIER_PERKS: Record<SubmissionTier, string[]> = {
  free:    ["2 tester slots", "Community visibility", "Standard queue"],
  starter: ["14 dedicated testers", "Priority listing", "Slot progress tracker"],
  growth:  ["20 dedicated testers", "Priority listing", "Slot progress tracker", "Creator analytics"],
  pro:     ["40 dedicated testers", "Top of feed placement", "Creator analytics", "Fastest feedback"],
  custom:  ["Custom tester count", "All Pro features", "Best value at scale"],
};

export function SubmitApp() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tier selection
  const [selectedTier, setSelectedTier] = useState<SubmissionTier>("free");
  const [customAmount, setCustomAmount] = useState<number>(20);

  // App details
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

  const activeTier = TIERS.find((t) => t.id === selectedTier);
  const isPaid = selectedTier !== "free";
  const testerSlots =
    selectedTier === "custom"
      ? slotsForCustomAmount(customAmount)
      : (activeTier?.slots ?? 2);
  const paymentAmount =
    selectedTier === "custom"
      ? customAmount
      : (activeTier?.price ?? 0);

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
      tier: selectedTier,
      tester_slots: testerSlots,
      payment_status: isPaid ? "pending" : "none",
      payment_amount_usd: paymentAmount,
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
              Choose how many testers you want, fill in your app details, done.
            </p>

            <div className="space-y-8">

              {/* ── Step 1: Choose Plan ── */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-4">
                  Step 1 — Choose Testing Plan
                </label>

                {/* Standard tiers grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {TIERS.map((tier) => {
                    const isSelected = selectedTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedTier(tier.id)}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border text-left transition-all duration-200 ${
                          isSelected
                            ? tier.highlight
                              ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                              : "border-white/25 bg-white/[0.06]"
                            : "border-white/[0.07] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/15"
                        }`}
                      >
                        {tier.highlight && (
                          <span className="absolute -top-2.5 left-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-black px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <span className={`text-xs font-semibold mb-1 ${isSelected ? "text-white" : "text-white/50"}`}>
                          {tier.label}
                        </span>
                        <span className={`text-xl font-bold mb-1 ${isSelected ? "text-white" : "text-white/70"}`}>
                          {tier.price === 0 ? "Free" : `$${tier.price}`}
                        </span>
                        <span className="text-[11px] text-white/30">{tier.slots} testers</span>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                            <Check size={10} className="text-black" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom tier */}
                <div
                  onClick={() => setSelectedTier("custom")}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                    selectedTier === "custom"
                      ? "border-violet-500/40 bg-violet-500/[0.05]"
                      : "border-white/[0.07] bg-white/[0.01] hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className={selectedTier === "custom" ? "text-violet-400" : "text-white/30"} />
                      <span className={`text-sm font-medium ${selectedTier === "custom" ? "text-white" : "text-white/50"}`}>
                        Custom Plan
                      </span>
                      <span className="text-[11px] text-white/25">$10 – $50 max</span>
                    </div>
                    {selectedTier === "custom" && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                        <Check size={10} className="text-black" />
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {selectedTier === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-3 pt-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white/40">$</span>
                            <input
                              type="number"
                              min={CUSTOM_MIN_USD}
                              max={CUSTOM_MAX_USD}
                              value={customAmount}
                              onChange={(e) =>
                                setCustomAmount(
                                  Math.max(CUSTOM_MIN_USD, Math.min(CUSTOM_MAX_USD, parseInt(e.target.value) || CUSTOM_MIN_USD))
                                )
                              }
                              className="w-24 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20 text-center"
                            />
                            <input
                              type="range"
                              min={CUSTOM_MIN_USD}
                              max={CUSTOM_MAX_USD}
                              step={5}
                              value={customAmount}
                              onChange={(e) => setCustomAmount(parseInt(e.target.value))}
                              className="flex-1 accent-violet-500"
                            />
                          </div>
                          <p className="text-sm text-violet-300/80">
                            <span className="font-bold text-white">{slotsForCustomAmount(customAmount)} testers</span>
                            {" "}for ${customAmount} · {CUSTOM_SLOTS_PER_DOLLAR} slots per dollar
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {selectedTier !== "custom" && (
                    <p className="text-xs text-white/25">
                      Need more than 40 testers? Pick any amount up to $50 and get {CUSTOM_SLOTS_PER_DOLLAR} testers per dollar.
                    </p>
                  )}
                </div>

                {/* Perks list */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {TIER_PERKS[selectedTier].map((perk) => (
                    <span key={perk} className="inline-flex items-center gap-1 text-[11px] text-white/40 bg-white/[0.03] px-2.5 py-1 rounded-full border border-white/[0.06]">
                      <Check size={10} className="text-emerald-400" />
                      {perk}
                    </span>
                  ))}
                </div>

                {/* Payment notice for paid */}
                {isPaid && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
                    <Clock size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-400/80 leading-relaxed">
                      Your submission will be created with <strong className="text-amber-400">{testerSlots} reserved slots</strong>.
                      Payment of <strong className="text-amber-400">${paymentAmount}</strong> activates them.
                      You'll see payment instructions after submitting.
                    </p>
                  </div>
                )}
              </div>

              {/* ── Step 2: App Details ── */}
              <div className="border-t border-white/[0.06] pt-8 space-y-5">
                <label className="block text-xs text-white/40 uppercase tracking-wider">
                  Step 2 — App Details
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
              </div>

              {/* Summary bar */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <Users size={16} className="text-white/30 shrink-0" />
                <span className="text-sm text-white/50">
                  <span className="text-white font-medium">{testerSlots} tester slots</span>
                  {isPaid
                    ? ` · $${paymentAmount} — activated after payment`
                    : " · Free — activated immediately"}
                </span>
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
                {submitting
                  ? "Submitting…"
                  : isPaid
                  ? `Reserve ${testerSlots} Slots — $${paymentAmount}`
                  : "Share with Community"}
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
