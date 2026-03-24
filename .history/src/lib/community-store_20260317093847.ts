import { supabase } from "./supabase";
import type {
  AppSubmission,
  AppFeedback,
  Platform,
  AppCategory,
  SortOption,
  SubmissionTier,
  PaymentStatus,
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
  platform: Platform;
  category: AppCategory;
  screenshot_url?: string | null;
  tier: SubmissionTier;
  tester_slots: number;
  payment_status: PaymentStatus;
  payment_amount_usd: number;
  user_name: string;
  user_avatar: string | null;
}): Promise<AppSubmission | null> {
  // Enforce repo-credit rules in the database via RPC
  // (Front-end still passes tier/payment fields for backward compatibility,
  // but RPC will set them to free/none for now.)
  const { data, error } = await supabase.rpc("create_submission_with_repos", {
    p_title: submission.title,
    p_description: submission.description,
    p_app_url: submission.app_url,
    p_platform: submission.platform,
    p_category: submission.category,
    p_screenshot_url: submission.screenshot_url ?? null,
    p_user_name: submission.user_name,
    p_user_avatar: submission.user_avatar,
    // defaults: cost 15, slots 20
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

export async function isCommunityAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_community_admin");
  if (error) return false;
  return Boolean(data);
}

/* ───────── Screenshot Upload ───────── */

export async function uploadCommunityScreenshot(file: File): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const safeExt = /^(png|jpg|jpeg|webp)$/.test(ext) ? ext : "png";
  const path = `${user.id}/${crypto.randomUUID()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from("community-screenshots")
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    console.error("Screenshot upload failed:", uploadError.message);
    return null;
  }

  const { data } = supabase.storage.from("community-screenshots").getPublicUrl(path);
  return data.publicUrl;
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
