import { supabase } from "./supabase";
import type {
  AppSubmission,
  AppFeedback,
  Platform,
  AppCategory,
  SortOption,
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
  user_name: string;
  user_avatar: string | null;
}): Promise<AppSubmission | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("app_submissions")
    .insert({
      user_id: user.id,
      title: submission.title,
      description: submission.description,
      app_url: submission.app_url,
      platform: submission.platform,
      category: submission.category,
      screenshot_url: submission.screenshot_url ?? null,
      user_name: submission.user_name,
      user_avatar: submission.user_avatar,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create submission:", error.message);
    return null;
  }
  return data;
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
}): Promise<AppFeedback | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("app_feedback")
    .upsert(
      {
        submission_id: feedback.submission_id,
        user_id: user.id,
        rating: feedback.rating,
        feedback_text: feedback.feedback_text,
        areas: feedback.areas,
        device_info: feedback.device_info ?? null,
        user_name: feedback.user_name,
        user_avatar: feedback.user_avatar,
      },
      { onConflict: "submission_id,user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to submit feedback:", error.message);
    return null;
  }

  // Increment feedback_count on the submission
  await supabase.rpc("increment_feedback_count", { row_id: feedback.submission_id });

  return data;
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

  // Check if already upvoted
  const { data: existing } = await supabase
    .from("app_upvotes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (existing) {
    // Remove upvote
    await supabase.from("app_upvotes").delete().eq("user_id", user.id).eq("submission_id", submissionId);
    const { data: sub } = await supabase.rpc("decrement_upvotes", { row_id: submissionId });
    return { upvoted: false, newCount: sub ?? 0 };
  } else {
    // Add upvote
    await supabase.from("app_upvotes").insert({ user_id: user.id, submission_id: submissionId });
    const { data: sub } = await supabase.rpc("increment_upvotes", { row_id: submissionId });
    return { upvoted: true, newCount: sub ?? 0 };
  }
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
