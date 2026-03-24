import { supabase } from "./supabase";
import type {
  AppSubmission,
  AppFeedback,
  FeedbackReply,
  Platform,
  AppCategory,
  SortOption,
  ListingType,
} from "./community-types";

const PAGE_SIZE = 20;

/* ───────── Submissions ───────── */

export async function getSubmissions(opts: {
  page?: number;
  platform?: Platform | "all";
  category?: AppCategory | "all";
  sort?: SortOption;
  search?: string;
}): Promise<{ data: AppSubmission[]; hasMore: boolean }> {
  const { page = 0, platform = "all", category = "all", sort = "newest", search } = opts;

  let query = supabase
    .from("app_submissions")
    .select("*")
    .eq("status", "active");

  if (platform !== "all") query = query.eq("platform", platform);
  if (category !== "all") query = query.eq("category", category);
  if (search && search.trim()) query = query.ilike("title", `%${search.trim()}%`);

  switch (sort) {
    case "most-upvoted":
      query = query.order("upvotes", { ascending: false });
      break;
    case "most-feedback":
      query = query.order("feedback_count", { ascending: false });
      break;
    case "needs-love":
      query = query.order("feedback_count", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch submissions:", error.message);
    return { data: [], hasMore: false };
  }
  return { data: data ?? [], hasMore: (data?.length ?? 0) > PAGE_SIZE };
}

export async function getSubmissionById(id: string): Promise<AppSubmission | null> {
  const { data, error } = await supabase
    .from("app_submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch submission:", error.message);
    return null;
  }
  return data;
}

export async function getUserSubmissions(userId: string): Promise<AppSubmission[]> {
  const { data, error } = await supabase
    .from("app_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user submissions:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createSubmission(submission: {
  title: string;
  description: string;
  app_url: string;
  listing_type: ListingType;
  platform: Platform;
  category: AppCategory;
  screenshot_url?: string | null;
  tester_slots: number;
  user_name: string;
  user_avatar: string | null;
}): Promise<AppSubmission | null> {
  const { data, error } = await supabase.rpc("create_submission_with_repos", {
    p_title: submission.title,
    p_description: submission.description,
    p_app_url: submission.app_url,
    p_listing_type: submission.listing_type,
    p_platform: submission.platform,
    p_category: submission.category,
    p_screenshot_url: submission.screenshot_url ?? null,
    p_user_name: submission.user_name,
    p_user_avatar: submission.user_avatar,
  });

  if (error || !data) {
    console.error("Failed to create submission:", error?.message ?? "No data");
    return null;
  }

  return data as AppSubmission;
}

export async function updateSubmissionStatus(
  id: string,
  status: "active" | "closed"
): Promise<boolean> {
  const { error } = await supabase
    .from("app_submissions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  return !error;
}

export async function updateSubmission(
  id: string,
  fields: { title?: string; description?: string; app_url?: string; listing_type?: ListingType; platform?: Platform; category?: AppCategory; screenshot_url?: string | null }
): Promise<boolean> {
  const { error } = await supabase
    .from("app_submissions")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  return !error;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("app_submissions")
    .delete()
    .eq("id", id);

  return !error;
}

/* ───────── Feedback ───────── */

export async function getFeedback(submissionId: string): Promise<AppFeedback[]> {
  const { data, error } = await supabase
    .from("app_feedback")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch feedback:", error.message);
    return [];
  }
  return data ?? [];
}

export async function submitFeedback(feedback: {
  submission_id: string;
  rating: number;
  feedback_text: string;
  areas: string[];
  device_info?: string | null;
  user_name: string;
  user_avatar: string | null;
}): Promise<{ feedback: AppFeedback | null; awarded: number; new_balance: number; error?: string }> {
  const { data, error } = await supabase.rpc("submit_feedback_with_repos", {
    p_submission_id: feedback.submission_id,
    p_rating: feedback.rating,
    p_feedback_text: feedback.feedback_text,
    p_areas: feedback.areas,
    p_device_info: feedback.device_info ?? null,
    p_user_name: feedback.user_name,
    p_user_avatar: feedback.user_avatar,
  });

  if (error || !data) {
    console.error("Failed to submit feedback:", error?.message ?? "No data");
    return { feedback: null, awarded: 0, new_balance: 0, error: error?.message ?? "No data" };
  }

  // RPC returns { feedback, awarded, new_balance }
  const payload = data as { feedback?: AppFeedback; awarded?: number; new_balance?: number };
  return {
    feedback: payload.feedback ?? null,
    awarded: typeof payload.awarded === "number" ? payload.awarded : 0,
    new_balance: typeof payload.new_balance === "number" ? payload.new_balance : 0,
  };
}

/* ───────── Repo Credits ───────── */

export async function getMyRepoBalance(): Promise<number> {
  const { data, error } = await supabase.rpc("get_my_repo_balance");
  if (error) return 0;
  return typeof data === "number" ? data : 0;
}

export async function claimWelcomeRepos(): Promise<{ granted: boolean; balance: number }> {
  const { data, error } = await supabase.rpc("claim_welcome_repos");
  if (error || !data) return { granted: false, balance: 0 };
  const payload = data as { granted: boolean; balance: number };
  return { granted: Boolean(payload.granted), balance: typeof payload.balance === "number" ? payload.balance : 0 };
}

export async function isCommunityAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_community_admin");
  if (error) return false;
  return Boolean(data);
}

/* ───────── Screenshot Helpers ───────── */

/** Parse the screenshot_url TEXT column which may be a JSON array or a plain URL */
export function parseScreenshots(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s: unknown) => typeof s === "string" && s);
  } catch {
    // not JSON — treat as single URL
  }
  return raw.trim() ? [raw.trim()] : [];
}

/** Serialize an array of screenshot URLs into the TEXT column format */
export function serializeScreenshots(urls: string[]): string | null {
  const filtered = urls.filter(Boolean);
  if (filtered.length === 0) return null;
  if (filtered.length === 1) return filtered[0]; // backward-compat: single URL stored as plain string
  return JSON.stringify(filtered);
}

/* ───────── Screenshot Upload ───────── */

export async function uploadCommunityScreenshot(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("Screenshot upload: user not authenticated");
    return null;
  }

  // Validate file type client-side
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    console.error("Screenshot upload: invalid file type", file.type);
    return null;
  }

  // Validate file size (5 MB)
  if (file.size > 5 * 1024 * 1024) {
    console.error("Screenshot upload: file too large", file.size);
    return null;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeExt = /^(png|jpg|jpeg|webp)$/.test(ext) ? ext : "png";
  const path = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from("community-screenshots")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    console.error("Screenshot upload failed:", uploadError.message, uploadError);
    return null;
  }

  const { data } = supabase.storage.from("community-screenshots").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadMultipleScreenshots(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadCommunityScreenshot(file);
    if (url) urls.push(url);
  }
  return urls;
}

/* ───────── Click Tracking ───────── */

export async function trackClick(submissionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  // Use sessionStorage for anonymous session continuity
  let sessionId = sessionStorage.getItem("df_session");
  if (!sessionId) {
    sessionId = Math.random().toString(36).slice(2);
    sessionStorage.setItem("df_session", sessionId);
  }
  await supabase.rpc("track_app_click", {
    p_submission_id: submissionId,
    p_user_id: user?.id ?? null,
    p_session: sessionId,
  });
}

export async function getSubmissionStats(
  submissionId: string
): Promise<{ total_clicks: number; unique_clicks: number }> {
  const { data, error } = await supabase.rpc("get_submission_stats", {
    p_submission_id: submissionId,
  });
  if (error || !data) return { total_clicks: 0, unique_clicks: 0 };
  return data as { total_clicks: number; unique_clicks: number };
}

export async function deleteFeedback(feedbackId: string, submissionId: string): Promise<boolean> {
  const { error } = await supabase
    .from("app_feedback")
    .delete()
    .eq("id", feedbackId);

  if (!error) {
    await supabase.rpc("decrement_feedback_count", { row_id: submissionId });
  }

  return !error;
}

/* ───────── Reports / Flags ───────── */

export async function reportSubmission(submissionId: string, reason: string): Promise<boolean> {
  const { error } = await supabase.rpc("report_submission", {
    p_submission_id: submissionId,
    p_reason: reason,
  });
  return !error;
}

/* ───────── Upvotes ───────── */

export async function toggleUpvote(submissionId: string): Promise<{ upvoted: boolean; newCount: number } | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Atomic upvote toggle via SQL RPC
  const { data, error } = await supabase.rpc("toggle_upvote", {
    p_submission_id: submissionId,
  });

  if (error || !data) {
    console.error("toggleUpvote failed:", error?.message);
    return null;
  }

  const result = data as { upvoted: boolean; new_count: number };
  return { upvoted: result.upvoted, newCount: result.new_count };
}

export async function getUserUpvotes(userId: string, submissionIds: string[]): Promise<Set<string>> {
  if (!submissionIds.length) return new Set();

  const { data } = await supabase
    .from("app_upvotes")
    .select("submission_id")
    .eq("user_id", userId)
    .in("submission_id", submissionIds);

  return new Set((data ?? []).map((r) => r.submission_id));
}

/* ───────── Replies ───────── */

export async function getReplies(feedbackIds: string[]): Promise<Record<string, FeedbackReply[]>> {
  if (!feedbackIds.length) return {};
  const { data, error } = await supabase
    .from("feedback_replies")
    .select("*")
    .in("feedback_id", feedbackIds)
    .order("created_at", { ascending: true });

  if (error || !data) return {};

  const map: Record<string, FeedbackReply[]> = {};
  for (const reply of data as FeedbackReply[]) {
    (map[reply.feedback_id] ??= []).push(reply);
  }
  return map;
}

export async function submitReply(reply: {
  feedback_id: string;
  reply_text: string;
  user_name: string;
  user_avatar: string | null;
}): Promise<FeedbackReply | null> {
  const { data, error } = await supabase
    .from("feedback_replies")
    .insert({
      feedback_id: reply.feedback_id,
      reply_text: reply.reply_text,
      user_name: reply.user_name,
      user_avatar: reply.user_avatar,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to submit reply:", error.message);
    return null;
  }
  return data as FeedbackReply;
}

export async function deleteReply(replyId: string): Promise<boolean> {
  const { error } = await supabase
    .from("feedback_replies")
    .delete()
    .eq("id", replyId);
  return !error;
}

/* ───────── Presence / Online Count ───────── */

let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeToCommunityPresence(
  userId: string | null,
  onCountChange: (count: number) => void
) {
  presenceChannel = supabase.channel("community-online", {
    config: { presence: { key: userId ?? `anon-${Math.random().toString(36).slice(2)}` } },
  });

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel!.presenceState();
      onCountChange(Object.keys(state).length);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel!.track({ online_at: new Date().toISOString() });
      }
    });

  return () => {
    presenceChannel?.unsubscribe();
    presenceChannel = null;
  };
}
