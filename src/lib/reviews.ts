import { supabase } from "./supabase";

export interface Review {
  id: string;
  user_id: string;
  tool_slug: string;
  rating: number;
  comment: string;
  user_name: string;
  user_avatar: string | null;
  created_at: string;
}

export interface ReviewStats {
  average: number;
  count: number;
}

/** Fetch all reviews for a specific tool (newest first) */
export async function getReviews(toolSlug: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("tool_slug", toolSlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error.message);
    return [];
  }
  return data ?? [];
}

/** Get average rating & count for a tool */
export async function getReviewStats(toolSlug: string): Promise<ReviewStats> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("tool_slug", toolSlug);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / data.length) * 10) / 10, count: data.length };
}

/** Submit or update a review (upsert: one review per user per tool) */
export async function submitReview(
  toolSlug: string,
  rating: number,
  comment: string,
  userName: string,
  userAvatar: string | null
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in to leave a review." };

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      tool_slug: toolSlug,
      rating,
      comment: comment.trim(),
      user_name: userName,
      user_avatar: userAvatar,
    },
    { onConflict: "user_id,tool_slug" }
  );

  return { error: error?.message ?? null };
}

/** Delete your own review */
export async function deleteReview(reviewId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  return { error: error?.message ?? null };
}

/** Fetch all reviews written by a specific user */
export async function getReviewsByUser(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch user reviews:", error.message);
    return [];
  }
  return data ?? [];
}
