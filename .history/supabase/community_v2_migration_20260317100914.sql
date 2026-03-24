-- ═══════════════════════════════════════════════════════════════
-- Community V2 Migration
-- Run this AFTER all previous community_*.sql files.
-- Adds: listing_type column, atomic upvote, welcome repos,
--        report/flag table, and updated create_submission_with_repos.
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════
-- 1. Add listing_type column to app_submissions
-- ═══════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_submissions' AND column_name = 'listing_type'
  ) THEN
    ALTER TABLE app_submissions
      ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'app'
      CHECK (listing_type IN ('app', 'website', 'youtube', 'service'));
  END IF;
END $$;

-- ═══════════════════════════════════════════
-- 2. Atomic upvote toggle RPC
--    Returns JSON: { upvoted: bool, new_count: int }
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION toggle_upvote(p_submission_id UUID)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_exists BOOLEAN;
  v_new_count INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM app_upvotes
    WHERE user_id = v_uid AND submission_id = p_submission_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM app_upvotes
    WHERE user_id = v_uid AND submission_id = p_submission_id;

    UPDATE app_submissions
    SET upvotes = GREATEST(upvotes - 1, 0)
    WHERE id = p_submission_id
    RETURNING upvotes INTO v_new_count;

    RETURN json_build_object('upvoted', false, 'new_count', COALESCE(v_new_count, 0));
  ELSE
    INSERT INTO app_upvotes (user_id, submission_id)
    VALUES (v_uid, p_submission_id);

    UPDATE app_submissions
    SET upvotes = upvotes + 1
    WHERE id = p_submission_id
    RETURNING upvotes INTO v_new_count;

    RETURN json_build_object('upvoted', true, 'new_count', COALESCE(v_new_count, 0));
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 3. Welcome repos: grant 15 repos on first visit
--    Idempotent — only grants once per user.
--    Returns JSON: { granted: bool, balance: int }
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION claim_welcome_repos()
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_balance INT;
  v_already BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('granted', false, 'balance', 0);
  END IF;

  PERFORM ensure_repo_row(v_uid);

  -- Check if welcome_bonus already granted
  SELECT EXISTS(
    SELECT 1 FROM community_repo_events
    WHERE user_id = v_uid AND reason = 'welcome_bonus'
  ) INTO v_already;

  IF v_already THEN
    SELECT balance INTO v_balance FROM community_user_repos WHERE user_id = v_uid;
    RETURN json_build_object('granted', false, 'balance', COALESCE(v_balance, 0));
  END IF;

  INSERT INTO community_repo_events (user_id, delta, reason)
  VALUES (v_uid, 15, 'welcome_bonus');

  UPDATE community_user_repos
  SET balance = balance + 15, updated_at = now()
  WHERE user_id = v_uid
  RETURNING balance INTO v_balance;

  RETURN json_build_object('granted', true, 'balance', COALESCE(v_balance, 15));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 4. Reports / Flags table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES app_submissions(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, reporter_id)
);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Only admins can see reports
DROP POLICY IF EXISTS "Admins can read reports" ON community_reports;
CREATE POLICY "Admins can read reports"
  ON community_reports FOR SELECT
  USING (EXISTS(SELECT 1 FROM community_admins WHERE user_id = auth.uid()));

-- Report RPC: one report per user per submission
CREATE OR REPLACE FUNCTION report_submission(p_submission_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  INSERT INTO community_reports (submission_id, reporter_id, reason)
  VALUES (p_submission_id, v_uid, p_reason)
  ON CONFLICT (submission_id, reporter_id) DO NOTHING;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 5. Updated create_submission_with_repos
--    Now accepts p_listing_type parameter.
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
    user_id,
    title,
    description,
    app_url,
    listing_type,
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
      SELECT id
      FROM community_repo_events
      WHERE user_id = v_uid
        AND reason = 'submission_cost'
        AND submission_id IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    );
  END IF;

  RETURN row_to_json(v_submission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
