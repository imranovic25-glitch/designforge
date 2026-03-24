-- Run this AFTER community_setup.sql and community_add_tiers.sql
-- Adds: "Repo credits" exchange system (earn credits for feedback, spend to submit)
--
-- Rules (MVP):
-- - Earn 5 repos for FIRST feedback on an app (per user per submission)
-- - Spend 15 repos to submit an app
-- - No repos awarded for feedback on your own submission

-- Admins bypass repo limits
CREATE TABLE IF NOT EXISTS community_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_admins ENABLE ROW LEVEL SECURITY;

-- Keep admin list private
DROP POLICY IF EXISTS "No public read" ON community_admins;
CREATE POLICY "No public read"
  ON community_admins FOR SELECT
  USING (false);

CREATE OR REPLACE FUNCTION is_community_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM community_admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ═══════════════════════════════════════════
-- 1. User balance table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_user_repos (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_user_repos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own repo balance" ON community_user_repos;
DROP POLICY IF EXISTS "Users can init own repo balance" ON community_user_repos;

CREATE POLICY "Users can read own repo balance"
  ON community_user_repos FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to initialize their row (only for themselves)
CREATE POLICY "Users can init own repo balance"
  ON community_user_repos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 2. Events ledger (audit trail)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_repo_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  submission_id UUID REFERENCES app_submissions(id) ON DELETE SET NULL,
  feedback_id UUID REFERENCES app_feedback(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repo_events_user_created ON community_repo_events(user_id, created_at DESC);

ALTER TABLE community_repo_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own repo events" ON community_repo_events;

CREATE POLICY "Users can read own repo events"
  ON community_repo_events FOR SELECT
  USING (auth.uid() = user_id);

-- No direct inserts/updates/deletes by clients; only via SECURITY DEFINER RPCs.

-- Prevent reward farming: only one feedback award per user per submission
CREATE UNIQUE INDEX IF NOT EXISTS ux_repo_feedback_award_once
  ON community_repo_events (user_id, submission_id)
  WHERE reason = 'feedback_award' AND submission_id IS NOT NULL;

-- ═══════════════════════════════════════════
-- 3. Helper: ensure a balance row exists
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION ensure_repo_row(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO community_user_repos (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 4. Public RPC: get my balance
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_my_repo_balance()
RETURNS INT AS $$
DECLARE
  v_uid UUID;
  v_balance INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN 0;
  END IF;

  PERFORM ensure_repo_row(v_uid);

  SELECT balance INTO v_balance
  FROM community_user_repos
  WHERE user_id = v_uid;

  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 5. Block feedback on own submissions (DB-side)
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Users can insert their own feedback" ON app_feedback;

CREATE POLICY "Users can insert their own feedback"
  ON app_feedback FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND auth.uid() <> (SELECT user_id FROM app_submissions WHERE id = submission_id)
  );

-- ═══════════════════════════════════════════
-- 6. RPC: submit feedback + fill slot + award repos (atomic)
--
-- Returns JSON:
-- { feedback: <row>, awarded: 0|5, new_balance: int }
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION submit_feedback_with_repos(
  p_submission_id UUID,
  p_rating SMALLINT,
  p_feedback_text TEXT,
  p_areas TEXT[] DEFAULT '{}',
  p_device_info TEXT DEFAULT NULL,
  p_user_name TEXT DEFAULT NULL,
  p_user_avatar TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_owner UUID;
  v_status TEXT;
  v_feedback app_feedback;
  v_feedback_id UUID;
  v_inserted BOOLEAN;
  v_awarded INT := 0;
  v_new_balance INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT user_id, status
    INTO v_owner, v_status
  FROM app_submissions
  WHERE id = p_submission_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'submission_not_found';
  END IF;

  IF v_uid = v_owner THEN
    RAISE EXCEPTION 'cannot_feedback_own_submission';
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'closed';
  END IF;

  INSERT INTO app_feedback (
    submission_id, user_id, rating, feedback_text, areas, device_info, user_name, user_avatar
  ) VALUES (
    p_submission_id, v_uid, p_rating, p_feedback_text, COALESCE(p_areas, '{}'), p_device_info, p_user_name, p_user_avatar
  )
  ON CONFLICT (submission_id, user_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    feedback_text = EXCLUDED.feedback_text,
    areas = EXCLUDED.areas,
    device_info = EXCLUDED.device_info,
    user_name = EXCLUDED.user_name,
    user_avatar = EXCLUDED.user_avatar
  RETURNING id, (xmax = 0) INTO v_feedback_id, v_inserted;

  SELECT * INTO v_feedback
  FROM app_feedback
  WHERE id = v_feedback_id;

  -- Only the FIRST feedback should fill a slot + award repos
  IF v_inserted THEN
    PERFORM increment_feedback_count(p_submission_id);

    PERFORM ensure_repo_row(v_uid);

    -- Award 5 repos, once per feedback event
    BEGIN
      INSERT INTO community_repo_events (user_id, delta, reason, submission_id, feedback_id)
      VALUES (v_uid, 5, 'feedback_award', p_submission_id, v_feedback.id);

      UPDATE community_user_repos
      SET balance = balance + 5, updated_at = now()
      WHERE user_id = v_uid
      RETURNING balance INTO v_new_balance;

      v_awarded := 5;
    EXCEPTION WHEN unique_violation THEN
      -- already awarded
      SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
      v_awarded := 0;
    END;
  ELSE
    SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
    v_awarded := 0;
  END IF;

  RETURN json_build_object(
    'feedback', row_to_json(v_feedback),
    'awarded', v_awarded,
    'new_balance', COALESCE(v_new_balance, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 7. RPC: create submission (spend repos)
--
-- Returns the inserted app_submissions row as JSON.
-- MVP defaults:
-- - tester_slots: 20
-- - tier/payment fields set to free/none
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

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);

  PERFORM ensure_repo_row(v_uid);

  SELECT balance INTO v_balance
  FROM community_user_repos
  WHERE user_id = v_uid;

  IF NOT v_is_admin THEN
    IF COALESCE(v_balance, 0) < p_cost THEN
      RAISE EXCEPTION 'insufficient_repos';
    END IF;

    -- Spend repos
    INSERT INTO community_repo_events (user_id, delta, reason)
    VALUES (v_uid, -p_cost, 'submission_cost');

    UPDATE community_user_repos
    SET balance = balance - p_cost, updated_at = now()
    WHERE user_id = v_uid;
  END IF;

  INSERT INTO app_submissions (
    user_id,
    title,
    description,
    app_url,
    platform,
    category,
    screenshot_url,
    status,
    tier,
    tester_slots,
    slots_filled,
    payment_status,
    payment_amount_usd,
    upvotes,
    feedback_count,
    user_name,
    user_avatar
  ) VALUES (
    v_uid,
    p_title,
    p_description,
    p_app_url,
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

  -- attach event to submission
  IF NOT v_is_admin THEN
    UPDATE community_repo_events
    SET submission_id = v_submission.id
    WHERE user_id = v_uid
      AND reason = 'submission_cost'
      AND submission_id IS NULL
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  RETURN row_to_json(v_submission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
