-- Referral system: users earn 30 repos when someone they referred signs up.
-- The referred user also gets 10 bonus repos on top of the 15 welcome repos.

-- ═══════════════════════════════════════════
-- 1. Referral codes table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_referral_code_user
  ON community_referral_codes (user_id);

ALTER TABLE community_referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral code"
  ON community_referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON community_referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- 2. Referral claims table (tracks who referred whom)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS community_referral_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  referrer_awarded BOOLEAN DEFAULT false,
  referred_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id) -- each user can only be referred once
);

ALTER TABLE community_referral_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referral claims"
  ON community_referral_claims FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ═══════════════════════════════════════════
-- 3. RPC: Get or create my referral code
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_my_referral_code()
RETURNS TEXT AS $$
DECLARE
  v_uid UUID;
  v_code TEXT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT code INTO v_code
  FROM community_referral_codes
  WHERE user_id = v_uid;

  IF v_code IS NULL THEN
    -- Generate a unique 8-char alphanumeric code
    v_code := upper(substr(encode(gen_random_bytes(6), 'base64'), 1, 8));
    -- Remove ambiguous characters
    v_code := replace(replace(replace(v_code, '/', 'X'), '+', 'Y'), '=', 'Z');

    INSERT INTO community_referral_codes (user_id, code)
    VALUES (v_uid, v_code)
    ON CONFLICT (user_id) DO UPDATE SET code = EXCLUDED.code
    RETURNING code INTO v_code;
  END IF;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 4. RPC: Claim a referral (called by the NEW user after sign-up)
--    Awards 30 repos to the referrer, 10 bonus repos to the referred user
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION claim_referral(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_referrer_id UUID;
  v_already_claimed BOOLEAN;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Look up the referral code
  SELECT user_id INTO v_referrer_id
  FROM community_referral_codes
  WHERE code = upper(trim(p_code));

  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_code');
  END IF;

  -- Can't refer yourself
  IF v_referrer_id = v_uid THEN
    RETURN json_build_object('success', false, 'error', 'self_referral');
  END IF;

  -- Check if already claimed
  SELECT EXISTS(
    SELECT 1 FROM community_referral_claims WHERE referred_id = v_uid
  ) INTO v_already_claimed;

  IF v_already_claimed THEN
    RETURN json_build_object('success', false, 'error', 'already_claimed');
  END IF;

  -- Record the claim
  INSERT INTO community_referral_claims (referrer_id, referred_id, code)
  VALUES (v_referrer_id, v_uid, upper(trim(p_code)));

  -- Ensure balance rows exist
  PERFORM ensure_repo_row(v_referrer_id);
  PERFORM ensure_repo_row(v_uid);

  -- Award 30 repos to referrer
  UPDATE community_user_repos
  SET balance = balance + 30, updated_at = now()
  WHERE user_id = v_referrer_id;

  INSERT INTO community_repo_events (user_id, delta, reason)
  VALUES (v_referrer_id, 30, 'referral_bonus');

  -- Award 10 bonus repos to referred user
  UPDATE community_user_repos
  SET balance = balance + 10, updated_at = now()
  WHERE user_id = v_uid;

  INSERT INTO community_repo_events (user_id, delta, reason)
  VALUES (v_uid, 10, 'referral_welcome_bonus');

  -- Mark as awarded
  UPDATE community_referral_claims
  SET referrer_awarded = true, referred_awarded = true
  WHERE referrer_id = v_referrer_id AND referred_id = v_uid;

  RETURN json_build_object(
    'success', true,
    'referrer_awarded', 30,
    'referred_awarded', 10
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 5. RPC: Get my referral stats
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_my_referral_stats()
RETURNS JSON AS $$
DECLARE
  v_uid UUID;
  v_code TEXT;
  v_count INT;
  v_total_earned INT;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN json_build_object('code', null, 'count', 0, 'earned', 0);
  END IF;

  SELECT code INTO v_code
  FROM community_referral_codes
  WHERE user_id = v_uid;

  SELECT COUNT(*), COALESCE(SUM(CASE WHEN referrer_awarded THEN 30 ELSE 0 END), 0)
  INTO v_count, v_total_earned
  FROM community_referral_claims
  WHERE referrer_id = v_uid;

  RETURN json_build_object(
    'code', v_code,
    'count', v_count,
    'earned', v_total_earned
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
