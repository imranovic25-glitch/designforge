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

-- ═══════════════════════════════════════════
-- 9. Updated create_submission_with_repos
--    Now enforces community guidelines:
--    - Must include at least one screenshot
--    - Title >= 3 chars, description >= 10 chars
--    - URL must start with http:// or https://
--    Posts that fail these checks are rejected
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION create_submission_with_repos(
  p_title TEXT,
  p_description TEXT,
  p_app_url TEXT,
  p_platform TEXT,
  p_category TEXT,
  p_screenshot_url TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL,
  p_user_avatar TEXT DEFAULT NULL,
  p_listing_type TEXT DEFAULT 'app',
  p_cost INT DEFAULT 15,
  p_tester_slots INT DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_balance INT;
  v_is_admin BOOLEAN;
  v_submission app_submissions;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- ═══ Community guideline checks ═══
  IF char_length(COALESCE(p_title, '')) < 3 THEN
    RAISE EXCEPTION 'guideline_violation: Title must be at least 3 characters';
  END IF;
  IF char_length(COALESCE(p_description, '')) < 10 THEN
    RAISE EXCEPTION 'guideline_violation: Description must be at least 10 characters';
  END IF;
  IF NOT (COALESCE(p_app_url, '') ~* '^https?://') THEN
    RAISE EXCEPTION 'guideline_violation: App URL must be a valid http/https link';
  END IF;
  IF COALESCE(p_screenshot_url, '') = '' THEN
    RAISE EXCEPTION 'guideline_violation: At least one screenshot is required';
  END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);

  PERFORM ensure_repo_row(v_uid);

  SELECT balance INTO v_balance
  FROM community_user_repos
  WHERE user_id = v_uid;

  IF NOT v_is_admin THEN
    IF COALESCE(v_balance, 0) < p_cost THEN
      RAISE EXCEPTION 'insufficient_repos';
    END IF;

    INSERT INTO community_repo_events (user_id, delta, reason)
    VALUES (v_uid, -p_cost, 'submission_cost');

    UPDATE community_user_repos
    SET balance = balance - p_cost, updated_at = now()
    WHERE user_id = v_uid;
  END IF;

  INSERT INTO app_submissions (
    user_id, title, description, app_url, listing_type,
    platform, category, screenshot_url, status, tier,
    tester_slots, slots_filled, payment_status, payment_amount_usd,
    upvotes, feedback_count, user_name, user_avatar
  ) VALUES (
    v_uid,
    p_title,
    p_description,
    p_app_url,
    COALESCE(p_listing_type, 'app'),
    p_platform,
    p_category,
    p_screenshot_url,
    'active',
    'free',
    p_tester_slots,
    0,
    'none',
    0,
    0,
    0,
    p_user_name,
    p_user_avatar
  )
  RETURNING * INTO v_submission;

  IF NOT v_is_admin THEN
    UPDATE community_repo_events
    SET submission_id = v_submission.id
    WHERE id = (
      SELECT id FROM community_repo_events
      WHERE user_id = v_uid AND reason = 'submission_cost' AND submission_id IS NULL
      ORDER BY created_at DESC LIMIT 1
    );
  END IF;

  RETURN row_to_json(v_submission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 10. Chat Message Reports
--     Users can report offensive/spam messages.
--     After 3 reports a message is auto-hidden.
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_message_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL DEFAULT auth.uid(),
  reason      TEXT NOT NULL CHECK (char_length(reason) >= 2 AND char_length(reason) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, reporter_id)
);

ALTER TABLE public.chat_message_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON public.chat_message_reports;
CREATE POLICY "Users can create reports"
  ON public.chat_message_reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view reports" ON public.chat_message_reports;
CREATE POLICY "Admins can view reports"
  ON public.chat_message_reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM community_admins WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════
-- 11. Chat moderation columns on chat_messages
--     status: approved | flagged | hidden
-- ═══════════════════════════════════════════
DO $$ BEGIN
  ALTER TABLE public.chat_messages ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.chat_messages ADD COLUMN report_count INT NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.chat_messages ADD COLUMN moderated_by UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.chat_messages ADD COLUMN moderated_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════
-- 12. Moderation log table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_moderation_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     UUID NOT NULL DEFAULT auth.uid(),
  action       TEXT NOT NULL, -- 'approve', 'flag', 'hide', 'delete', 'ban'
  message_id   UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  target_user  UUID,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_moderation_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage moderation log" ON public.chat_moderation_log;
CREATE POLICY "Admins can manage moderation log"
  ON public.chat_moderation_log FOR ALL
  USING (
    EXISTS (SELECT 1 FROM community_admins WHERE user_id = auth.uid())
  );

-- ═══════════════════════════════════════════
-- 13. Blocked chat users table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.chat_blocked_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_by UUID NOT NULL DEFAULT auth.uid(),
  reason     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.chat_blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage blocked users" ON public.chat_blocked_users;
CREATE POLICY "Admins can manage blocked users"
  ON public.chat_blocked_users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM community_admins WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can check if they are blocked" ON public.chat_blocked_users;
CREATE POLICY "Users can check if they are blocked"
  ON public.chat_blocked_users FOR SELECT
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 14. Send Moderated Message RPC
--     Server-side validation:
--     - Length 1-500 chars
--     - Rate limit: max 3 msgs in 5 seconds, 30/hour
--     - Blocked user check
--     - Repeated message detection
--     - Bad word blacklist
--     - Auto-flag messages with many links
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION send_moderated_message(
  p_thread_id UUID,
  p_message_text TEXT
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_text TEXT;
  v_name TEXT;
  v_avatar TEXT;
  v_msg public.chat_messages;
  v_recent_5s INT;
  v_recent_1h INT;
  v_is_blocked BOOLEAN;
  v_last_text TEXT;
  v_status TEXT := 'approved';
  v_link_count INT;
  v_has_bad_words BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Trim + validate length
  v_text := TRIM(p_message_text);
  IF char_length(v_text) < 1 OR char_length(v_text) > 500 THEN
    RAISE EXCEPTION 'validation:Message must be 1-500 characters';
  END IF;

  -- Check if user is blocked
  SELECT EXISTS(
    SELECT 1 FROM chat_blocked_users WHERE user_id = v_uid
  ) INTO v_is_blocked;
  IF v_is_blocked THEN
    RAISE EXCEPTION 'blocked:You are restricted from sending messages';
  END IF;

  -- Check thread participation
  IF NOT EXISTS (
    SELECT 1 FROM chat_threads
    WHERE id = p_thread_id
      AND (participant_1 = v_uid OR participant_2 = v_uid)
  ) THEN
    RAISE EXCEPTION 'not_participant';
  END IF;

  -- Rate limit: max 3 messages in last 5 seconds
  SELECT COUNT(*) INTO v_recent_5s
  FROM chat_messages
  WHERE sender_id = v_uid AND created_at > now() - interval '5 seconds';
  IF v_recent_5s >= 3 THEN
    RAISE EXCEPTION 'rate_limit:Slow down! Wait a few seconds';
  END IF;

  -- Rate limit: max 30 messages per hour
  SELECT COUNT(*) INTO v_recent_1h
  FROM chat_messages
  WHERE sender_id = v_uid AND created_at > now() - interval '1 hour';
  IF v_recent_1h >= 30 THEN
    RAISE EXCEPTION 'rate_limit:Message limit reached. Try again later';
  END IF;

  -- Repeated message detection (same text in last 60s)
  SELECT message_text INTO v_last_text
  FROM chat_messages
  WHERE sender_id = v_uid AND thread_id = p_thread_id
  ORDER BY created_at DESC LIMIT 1;
  IF v_last_text IS NOT NULL AND LOWER(TRIM(v_last_text)) = LOWER(v_text) THEN
    RAISE EXCEPTION 'validation:Please don''t send the same message twice';
  END IF;

  -- Count links (http:// or https://)
  v_link_count := (char_length(v_text) - char_length(REPLACE(REPLACE(v_text, 'https://', ''), 'http://', ''))) / 7;
  IF v_link_count > 2 THEN
    v_status := 'flagged'; -- auto-flag messages with many links
  END IF;

  -- Simple bad-word check (server-side)
  v_has_bad_words := v_text ~* '\m(fuck|shit|bitch|nigger|faggot|cunt|dick|asshole|bastard|slut|whore)\M';
  IF v_has_bad_words THEN
    v_status := 'flagged';
  END IF;

  -- Get user info
  SELECT COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'User'),
         raw_user_meta_data->>'avatar_url'
  INTO v_name, v_avatar
  FROM auth.users WHERE id = v_uid;

  -- Insert the message
  INSERT INTO chat_messages (thread_id, sender_id, message_text, sender_name, sender_avatar, status)
  VALUES (p_thread_id, v_uid, v_text, v_name, v_avatar, v_status)
  RETURNING * INTO v_msg;

  -- Update thread last message
  UPDATE chat_threads
  SET last_message_text = v_text, last_message_at = now()
  WHERE id = p_thread_id;

  RETURN json_build_object(
    'id', v_msg.id,
    'thread_id', v_msg.thread_id,
    'sender_id', v_msg.sender_id,
    'message_text', v_msg.message_text,
    'sender_name', v_msg.sender_name,
    'sender_avatar', v_msg.sender_avatar,
    'created_at', v_msg.created_at,
    'status', v_msg.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 15. Report Chat Message RPC
--     Auto-hides message after 3 reports
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION report_chat_message(
  p_message_id UUID,
  p_reason TEXT
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_count INT;
  v_msg_sender UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Can't report own messages
  SELECT sender_id INTO v_msg_sender
  FROM chat_messages WHERE id = p_message_id;
  IF v_msg_sender = v_uid THEN
    RAISE EXCEPTION 'cannot_report_self';
  END IF;

  -- Insert report (unique per user per message)
  INSERT INTO chat_message_reports (message_id, reporter_id, reason)
  VALUES (p_message_id, v_uid, TRIM(p_reason))
  ON CONFLICT (message_id, reporter_id) DO NOTHING;

  -- Count total reports
  SELECT COUNT(*) INTO v_count
  FROM chat_message_reports
  WHERE message_id = p_message_id;

  -- Update report count
  UPDATE chat_messages
  SET report_count = v_count
  WHERE id = p_message_id;

  -- Auto-hide after 3 reports
  IF v_count >= 3 THEN
    UPDATE chat_messages
    SET status = 'hidden'
    WHERE id = p_message_id AND status != 'hidden';
  END IF;

  RETURN json_build_object('reported', true, 'total_reports', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 16. Admin: Moderate Message RPC
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION moderate_chat_message(
  p_message_id UUID,
  p_action TEXT, -- 'approve', 'flag', 'hide', 'delete'
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  IF NOT v_is_admin THEN RAISE EXCEPTION 'not_admin'; END IF;

  IF p_action = 'delete' THEN
    DELETE FROM chat_messages WHERE id = p_message_id;
  ELSE
    UPDATE chat_messages
    SET status = p_action, moderated_by = v_uid, moderated_at = now()
    WHERE id = p_message_id;
  END IF;

  -- Log the action
  INSERT INTO chat_moderation_log (admin_id, action, message_id, reason)
  VALUES (v_uid, p_action, p_message_id, p_reason);

  RETURN json_build_object('success', true, 'action', p_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 17. Admin: Ban/Unban Chat User
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION ban_chat_user(
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  IF NOT v_is_admin THEN RAISE EXCEPTION 'not_admin'; END IF;

  INSERT INTO chat_blocked_users (user_id, blocked_by, reason)
  VALUES (p_user_id, v_uid, p_reason)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO chat_moderation_log (admin_id, action, target_user, reason)
  VALUES (v_uid, 'ban', p_user_id, p_reason);

  RETURN json_build_object('banned', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION unban_chat_user(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  IF NOT v_is_admin THEN RAISE EXCEPTION 'not_admin'; END IF;

  DELETE FROM chat_blocked_users WHERE user_id = p_user_id;

  INSERT INTO chat_moderation_log (admin_id, action, target_user, reason)
  VALUES (v_uid, 'unban', p_user_id, 'Unbanned');

  RETURN json_build_object('unbanned', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 18. Admin: Get Flagged Messages RPC
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_flagged_messages(p_limit INT DEFAULT 50)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  IF NOT v_is_admin THEN RAISE EXCEPTION 'not_admin'; END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(m)), '[]'::json)
    FROM (
      SELECT
        cm.id,
        cm.thread_id,
        cm.sender_id,
        cm.message_text,
        cm.sender_name,
        cm.sender_avatar,
        cm.created_at,
        cm.status,
        cm.report_count,
        (SELECT COALESCE(json_agg(json_build_object(
          'reporter_id', r.reporter_id,
          'reason', r.reason,
          'created_at', r.created_at
        )), '[]'::json) FROM chat_message_reports r WHERE r.message_id = cm.id) AS reports
      FROM chat_messages cm
      WHERE cm.status IN ('flagged', 'hidden')
      ORDER BY cm.created_at DESC
      LIMIT p_limit
    ) m
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 19. Admin: Get Moderation Log
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_moderation_log(p_limit INT DEFAULT 50)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_is_admin BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  IF NOT v_is_admin THEN RAISE EXCEPTION 'not_admin'; END IF;

  RETURN (
    SELECT COALESCE(json_agg(row_to_json(l)), '[]'::json)
    FROM (
      SELECT * FROM chat_moderation_log
      ORDER BY created_at DESC
      LIMIT p_limit
    ) l
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
