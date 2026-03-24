export type Platform = "android" | "ios" | "web" | "desktop" | "cross-platform";

export type ListingType = "app" | "website" | "youtube" | "service";

export type AppCategory =
  | "productivity"
  | "social"
  | "finance"
  | "games"
  | "education"
  | "health"
  | "utility"
  | "entertainment"
  | "developer-tools"
  | "other";

export type SubmissionStatus = "active" | "closed";
export type SortOption = "newest" | "most-upvoted" | "most-feedback" | "needs-love";

export const PLATFORM_LABELS: Record<Platform, string> = {
  android: "Android",
  ios: "iOS",
  web: "Web",
  desktop: "Desktop",
  "cross-platform": "Cross-Platform",
};

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  app: "App",
  website: "Website",
  youtube: "YouTube Channel",
  service: "Service",
};

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  productivity: "Productivity",
  social: "Social",
  finance: "Finance",
  games: "Games",
  education: "Education",
  health: "Health",
  utility: "Utility",
  entertainment: "Entertainment",
  "developer-tools": "Developer Tools",
  other: "Other",
};

export const FEEDBACK_AREAS = [
  "UI / Design",
  "Performance",
  "Bugs",
  "Features",
  "Content",
  "Ease of Use",
] as const;

export type FeedbackArea = (typeof FEEDBACK_AREAS)[number];

export interface AppSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string;
  app_url: string;
  listing_type: ListingType;
  platform: Platform;
  category: AppCategory;
  screenshot_url: string | null;
  status: SubmissionStatus;
  tier: SubmissionTier;
  tester_slots: number;
  slots_filled: number;
  payment_status: PaymentStatus;
  payment_amount_usd: number;
  upvotes: number;
  feedback_count: number;
  user_name: string;
  user_avatar: string | null;
  created_at: string;
  updated_at: string;
  /** Whether the current viewer has upvoted (client-side enrichment) */
  has_upvoted?: boolean;
}

export interface AppFeedback {
  id: string;
  submission_id: string;
  user_id: string;
  rating: number;
  feedback_text: string;
  areas: string[];
  device_info: string | null;
  user_name: string;
  user_avatar: string | null;
  created_at: string;
}
