-- ============================================================
-- feedback_replies table + RLS policies
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.feedback_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.app_feedback(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL DEFAULT auth.uid(),
  reply_text TEXT NOT NULL CHECK (char_length(reply_text) >= 2 AND char_length(reply_text) <= 1000),
  user_name  TEXT NOT NULL DEFAULT '',
  user_avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index for fast lookups by feedback_id
CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback_id
  ON public.feedback_replies(feedback_id);

-- 3. Enable RLS
ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

-- 4. SELECT — anyone can read replies
CREATE POLICY "Replies are viewable by everyone"
  ON public.feedback_replies FOR SELECT
  USING (true);

-- 5. INSERT — only authenticated users can create replies
CREATE POLICY "Authenticated users can create replies"
  ON public.feedback_replies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 6. DELETE — users can only delete their own replies
CREATE POLICY "Users can delete own replies"
  ON public.feedback_replies FOR DELETE
  USING (auth.uid() = user_id);
