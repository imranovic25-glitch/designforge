-- ============================================================
-- Community V3 Migration (IDEMPOTENT — safe to re-run)
--   - feedback_replies table
--   - chat_threads + chat_messages tables
--   - get_or_create_chat_thread RPC
--   - get_community_members RPC (member discovery)
--   - get_my_threads_enriched RPC (thread list with names)
--   - auto-remove posts after 3 reports
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════
-- 1. Feedback Replies
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.feedback_replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.app_feedback(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL DEFAULT auth.uid(),
  reply_text TEXT NOT NULL CHECK (char_length(reply_text) >= 2 AND char_length(reply_text) <= 1000),
  user_name  TEXT NOT NULL DEFAULT '',
  user_avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_replies_feedback_id
  ON public.feedback_replies(feedback_id);

ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Replies are viewable by everyone" ON public.feedback_replies;
CREATE POLICY "Replies are viewable by everyone"
  ON public.feedback_replies FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create replies" ON public.feedback_replies;
CREATE POLICY "Authenticated users can create replies"
  ON public.feedback_replies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete own replies" ON public.feedback_replies;
CREATE POLICY "Users can delete own replies"
  ON public.feedback_replies FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 2. Chat Threads
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_text TEXT,
  last_message_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (participant_1, participant_2),
  CHECK (participant_1 < participant_2)
);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own threads" ON public.chat_threads;
CREATE POLICY "Users can see own threads"
  ON public.chat_threads FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

DROP POLICY IF EXISTS "Authenticated users can create threads" ON public.chat_threads;
CREATE POLICY "Authenticated users can create threads"
  ON public.chat_threads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND (auth.uid() = participant_1 OR auth.uid() = participant_2));

DROP POLICY IF EXISTS "Participants can update own threads" ON public.chat_threads;
CREATE POLICY "Participants can update own threads"
  ON public.chat_threads FOR UPDATE
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- ═══════════════════════════════════════════
-- 3. Chat Messages
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL DEFAULT auth.uid(),
  message_text TEXT NOT NULL CHECK (char_length(message_text) >= 1 AND char_length(message_text) <= 2000),
  sender_name  TEXT NOT NULL DEFAULT '',
  sender_avatar TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_thread_id
  ON public.chat_messages(thread_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own thread messages" ON public.chat_messages;
CREATE POLICY "Users can read own thread messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
        AND (t.participant_1 = auth.uid() OR t.participant_2 = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON public.chat_messages;
CREATE POLICY "Participants can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chat_threads t
      WHERE t.id = thread_id
        AND (t.participant_1 = auth.uid() OR t.participant_2 = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages"
  ON public.chat_messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Enable Realtime (ignore error if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════
-- 4. Get-or-Create Thread RPC
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_or_create_chat_thread(p_other_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_p1  UUID;
  v_p2  UUID;
  v_thread public.chat_threads%ROWTYPE;
  v_other_name TEXT;
  v_other_avatar TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF v_uid = p_other_user_id THEN RAISE EXCEPTION 'cannot_message_self'; END IF;

  IF v_uid < p_other_user_id THEN
    v_p1 := v_uid; v_p2 := p_other_user_id;
  ELSE
    v_p1 := p_other_user_id; v_p2 := v_uid;
  END IF;

  INSERT INTO public.chat_threads (participant_1, participant_2)
  VALUES (v_p1, v_p2)
  ON CONFLICT (participant_1, participant_2) DO NOTHING;

  SELECT * INTO v_thread FROM public.chat_threads
  WHERE participant_1 = v_p1 AND participant_2 = v_p2;

  SELECT COALESCE(
    (SELECT user_name FROM app_submissions WHERE user_id = p_other_user_id AND user_name != '' LIMIT 1),
    (SELECT user_name FROM app_feedback WHERE user_id = p_other_user_id AND user_name != '' LIMIT 1),
    'Member'
  ) INTO v_other_name;

  SELECT COALESCE(
    (SELECT user_avatar FROM app_submissions WHERE user_id = p_other_user_id AND user_avatar IS NOT NULL LIMIT 1),
    (SELECT user_avatar FROM app_feedback WHERE user_id = p_other_user_id AND user_avatar IS NOT NULL LIMIT 1)
  ) INTO v_other_avatar;

  RETURN json_build_object(
    'id', v_thread.id,
    'participant_1', v_thread.participant_1,
    'participant_2', v_thread.participant_2,
    'last_message_text', v_thread.last_message_text,
    'last_message_at', v_thread.last_message_at,
    'created_at', v_thread.created_at,
    'other_user_name', v_other_name,
    'other_user_avatar', v_other_avatar
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 5. Community Member Discovery RPC
--    Returns all users who have submitted
--    apps or given feedback (excluding self)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_community_members()
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();

  RETURN (
    SELECT json_agg(row_to_json(m))
    FROM (
      SELECT DISTINCT ON (user_id)
        user_id,
        user_name,
        user_avatar,
        created_at
      FROM (
        SELECT user_id, user_name, user_avatar, created_at FROM app_submissions
        UNION ALL
        SELECT user_id, user_name, user_avatar, created_at FROM app_feedback
      ) AS all_users
      WHERE user_id != v_uid
        AND user_name IS NOT NULL
        AND user_name != ''
      ORDER BY user_id, created_at DESC
    ) m
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 6. Get My Threads (enriched with other user info)
--    Returns threads with other_user_name/avatar
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_my_threads_enriched()
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  RETURN (
    SELECT json_agg(row_to_json(t))
    FROM (
      SELECT
        ct.id,
        ct.participant_1,
        ct.participant_2,
        ct.last_message_text,
        ct.last_message_at,
        ct.created_at,
        COALESCE(
          (SELECT user_name FROM app_submissions WHERE user_id = other_id AND user_name != '' LIMIT 1),
          (SELECT user_name FROM app_feedback WHERE user_id = other_id AND user_name != '' LIMIT 1),
          'Member'
        ) AS other_user_name,
        (SELECT user_avatar FROM app_submissions WHERE user_id = other_id AND user_avatar IS NOT NULL LIMIT 1) AS other_user_avatar
      FROM (
        SELECT *,
          CASE WHEN participant_1 = v_uid THEN participant_2 ELSE participant_1 END AS other_id
        FROM public.chat_threads
        WHERE participant_1 = v_uid OR participant_2 = v_uid
      ) ct
      ORDER BY ct.last_message_at DESC NULLS LAST
    ) t
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 7. Auto-remove posts after 3 reports
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION report_submission(p_submission_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_uid UUID;
  v_count INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  INSERT INTO community_reports (submission_id, reporter_id, reason)
  VALUES (p_submission_id, v_uid, p_reason)
  ON CONFLICT (submission_id, reporter_id) DO NOTHING;

  SELECT COUNT(*) INTO v_count
  FROM community_reports
  WHERE submission_id = p_submission_id;

  -- Auto-remove: 3+ unique reports = delete
  IF v_count >= 3 THEN
    DELETE FROM app_submissions WHERE id = p_submission_id;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 8. Submit Reply with 2 Repo Points
--    Awards 2 repos for the first reply
--    per user per feedback. Returns JSON:
--    { reply: <row>, awarded: 0|2, new_balance: int }
-- ═══════════════════════════════════════════

-- Prevent farming: one reply award per user per feedback
CREATE UNIQUE INDEX IF NOT EXISTS ux_repo_reply_award_once
  ON community_repo_events (user_id, feedback_id)
  WHERE reason = 'reply_award' AND feedback_id IS NOT NULL;

CREATE OR REPLACE FUNCTION submit_reply_with_repos(
  p_feedback_id UUID,
  p_reply_text TEXT,
  p_user_name TEXT DEFAULT NULL,
  p_user_avatar TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_reply feedback_replies;
  v_awarded INT := 0;
  v_new_balance INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Insert the reply
  INSERT INTO feedback_replies (feedback_id, user_id, reply_text, user_name, user_avatar)
  VALUES (p_feedback_id, v_uid, p_reply_text, COALESCE(p_user_name, ''), p_user_avatar)
  RETURNING * INTO v_reply;

  -- Ensure repo balance row exists
  PERFORM ensure_repo_row(v_uid);

  -- Award 2 repos (once per user per feedback)
  BEGIN
    INSERT INTO community_repo_events (user_id, delta, reason, feedback_id)
    VALUES (v_uid, 2, 'reply_award', p_feedback_id);

    UPDATE community_user_repos
    SET balance = balance + 2, updated_at = now()
    WHERE user_id = v_uid
    RETURNING balance INTO v_new_balance;

    v_awarded := 2;
  EXCEPTION WHEN unique_violation THEN
    -- Already awarded for a reply on this feedback
    SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
    v_awarded := 0;
  END;

  RETURN json_build_object(
    'reply', row_to_json(v_reply),
    'awarded', v_awarded,
    'new_balance', COALESCE(v_new_balance, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
