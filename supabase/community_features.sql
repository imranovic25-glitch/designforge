-- Pin, Boost, and Priority features for community submissions
-- Run AFTER community_repos.sql

-- ═══════════════════════════════════════════
-- 1. Add columns to app_submissions for pin/boost/priority
-- ═══════════════════════════════════════════
ALTER TABLE app_submissions
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS pinned_until TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS boosted_until TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS priority_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS priority_requested_at TIMESTAMPTZ DEFAULT NULL;

-- Index for finding active pins/boosts
CREATE INDEX IF NOT EXISTS idx_submissions_pinned ON app_submissions (is_pinned, pinned_until)
  WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_submissions_boosted ON app_submissions (is_boosted, boosted_until)
  WHERE is_boosted = true;
CREATE INDEX IF NOT EXISTS idx_submissions_priority ON app_submissions (priority_review, priority_requested_at)
  WHERE priority_review = true;

-- ═══════════════════════════════════════════
-- 2. RPC: Pin post for 24 hours (costs 25 repos)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION pin_submission(p_submission_id UUID)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_owner UUID;
  v_balance INT;
  v_is_admin BOOLEAN;
  v_cost INT := 25;
  v_new_balance INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT user_id INTO v_owner
  FROM app_submissions WHERE id = p_submission_id;

  IF v_owner IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  IF v_owner <> v_uid THEN
    RETURN json_build_object('success', false, 'error', 'not_owner');
  END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  PERFORM ensure_repo_row(v_uid);

  SELECT balance INTO v_balance FROM community_user_repos WHERE user_id = v_uid;

  IF NOT v_is_admin AND COALESCE(v_balance, 0) < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_repos', 'balance', v_balance);
  END IF;

  -- Deduct repos
  IF NOT v_is_admin THEN
    UPDATE community_user_repos
    SET balance = balance - v_cost, updated_at = now()
    WHERE user_id = v_uid
    RETURNING balance INTO v_new_balance;

    INSERT INTO community_repo_events (user_id, delta, reason, submission_id)
    VALUES (v_uid, -v_cost, 'pin_cost', p_submission_id);
  ELSE
    SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
  END IF;

  -- Pin for 24 hours
  UPDATE app_submissions
  SET is_pinned = true, pinned_until = now() + interval '24 hours'
  WHERE id = p_submission_id;

  RETURN json_build_object('success', true, 'new_balance', COALESCE(v_new_balance, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 3. RPC: Boost visibility (costs 25 repos, 48 hours)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION boost_submission(p_submission_id UUID)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_owner UUID;
  v_balance INT;
  v_is_admin BOOLEAN;
  v_cost INT := 25;
  v_new_balance INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT user_id INTO v_owner
  FROM app_submissions WHERE id = p_submission_id;

  IF v_owner IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  IF v_owner <> v_uid THEN
    RETURN json_build_object('success', false, 'error', 'not_owner');
  END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  PERFORM ensure_repo_row(v_uid);

  SELECT balance INTO v_balance FROM community_user_repos WHERE user_id = v_uid;

  IF NOT v_is_admin AND COALESCE(v_balance, 0) < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_repos', 'balance', v_balance);
  END IF;

  IF NOT v_is_admin THEN
    UPDATE community_user_repos
    SET balance = balance - v_cost, updated_at = now()
    WHERE user_id = v_uid
    RETURNING balance INTO v_new_balance;

    INSERT INTO community_repo_events (user_id, delta, reason, submission_id)
    VALUES (v_uid, -v_cost, 'boost_cost', p_submission_id);
  ELSE
    SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
  END IF;

  UPDATE app_submissions
  SET is_boosted = true, boosted_until = now() + interval '48 hours'
  WHERE id = p_submission_id;

  RETURN json_build_object('success', true, 'new_balance', COALESCE(v_new_balance, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 4. RPC: Request priority review (costs 10 repos)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION request_priority_review(p_submission_id UUID)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_owner UUID;
  v_balance INT;
  v_is_admin BOOLEAN;
  v_already BOOLEAN;
  v_cost INT := 10;
  v_new_balance INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT user_id, priority_review INTO v_owner, v_already
  FROM app_submissions WHERE id = p_submission_id;

  IF v_owner IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_found');
  END IF;

  IF v_owner <> v_uid THEN
    RETURN json_build_object('success', false, 'error', 'not_owner');
  END IF;

  IF v_already THEN
    RETURN json_build_object('success', false, 'error', 'already_requested');
  END IF;

  v_is_admin := EXISTS(SELECT 1 FROM community_admins WHERE user_id = v_uid);
  PERFORM ensure_repo_row(v_uid);

  SELECT balance INTO v_balance FROM community_user_repos WHERE user_id = v_uid;

  IF NOT v_is_admin AND COALESCE(v_balance, 0) < v_cost THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_repos', 'balance', v_balance);
  END IF;

  IF NOT v_is_admin THEN
    UPDATE community_user_repos
    SET balance = balance - v_cost, updated_at = now()
    WHERE user_id = v_uid
    RETURNING balance INTO v_new_balance;

    INSERT INTO community_repo_events (user_id, delta, reason, submission_id)
    VALUES (v_uid, -v_cost, 'priority_review_cost', p_submission_id);
  ELSE
    SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
  END IF;

  UPDATE app_submissions
  SET priority_review = true, priority_requested_at = now()
  WHERE id = p_submission_id;

  RETURN json_build_object('success', true, 'new_balance', COALESCE(v_new_balance, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 5. Auto-expire pins and boosts (call periodically or use pg_cron)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION expire_pins_and_boosts()
RETURNS void AS $$
BEGIN
  UPDATE app_submissions
  SET is_pinned = false
  WHERE is_pinned = true AND pinned_until < now();

  UPDATE app_submissions
  SET is_boosted = false
  WHERE is_boosted = true AND boosted_until < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
