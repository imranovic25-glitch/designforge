-- Community Sort Counts
-- Adds like_count / love_count columns and wires up reward_community_action to
-- increment them, so the feed can be sorted by Top Liked and Top Loved.
-- Also adds a helper RPC to get the total member count for the About section.
-- Run AFTER community_repos.sql

-- ═══════════════════════════════════════════
-- 1. Add counter columns to app_submissions
-- ═══════════════════════════════════════════
ALTER TABLE app_submissions
  ADD COLUMN IF NOT EXISTS like_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS love_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_submissions_like_count  ON app_submissions (like_count  DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_love_count  ON app_submissions (love_count  DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_feedback    ON app_submissions (feedback_count DESC);

-- ═══════════════════════════════════════════
-- 2. Updated reward_community_action
--    Now also increments like_count / love_count on the submission.
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION reward_community_action(
  p_submission_id UUID,
  p_action TEXT
)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_delta INT := 0;
  v_new_balance INT;
  v_awarded INT := 0;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('awarded', 0, 'new_balance', 0);
  END IF;

  CASE p_action
    WHEN 'upvote' THEN v_delta := 1;
    WHEN 'like'   THEN v_delta := 1;
    WHEN 'love'   THEN v_delta := 1;
    WHEN 'share'  THEN v_delta := 2;
    WHEN 'report' THEN v_delta := 1;
    ELSE RETURN json_build_object('awarded', 0, 'new_balance', 0);
  END CASE;

  PERFORM ensure_repo_row(v_uid);

  BEGIN
    INSERT INTO community_action_rewards (user_id, submission_id, action_type)
    VALUES (v_uid, p_submission_id, p_action);

    INSERT INTO community_repo_events (user_id, delta, reason, submission_id)
    VALUES (v_uid, v_delta, p_action || '_reward', p_submission_id);

    UPDATE community_user_repos
    SET balance = balance + v_delta, updated_at = now()
    WHERE user_id = v_uid
    RETURNING balance INTO v_new_balance;

    -- Increment the counter column on the submission
    IF p_action = 'like' THEN
      UPDATE app_submissions SET like_count = like_count + 1 WHERE id = p_submission_id;
    ELSIF p_action = 'love' THEN
      UPDATE app_submissions SET love_count = love_count + 1 WHERE id = p_submission_id;
    END IF;

    v_awarded := v_delta;
  EXCEPTION WHEN unique_violation THEN
    SELECT balance INTO v_new_balance FROM community_user_repos WHERE user_id = v_uid;
    v_awarded := 0;
  END;

  RETURN json_build_object('awarded', v_awarded, 'new_balance', COALESCE(v_new_balance, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 3. RPC: total member count (users who have a repo balance row)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_community_member_count()
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM community_user_repos;
$$ LANGUAGE sql SECURITY DEFINER;
