-- Run this AFTER community_setup.sql
-- Adds: tier/slot/payment columns, click tracking table, slot-fill function

-- ═══════════════════════════════════════════
-- 1. Add Tier & Slot Columns
-- ═══════════════════════════════════════════
ALTER TABLE app_submissions
  ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free'
    CHECK (tier IN ('free','starter','growth','pro','custom')),
  ADD COLUMN IF NOT EXISTS tester_slots INT DEFAULT 2,
  ADD COLUMN IF NOT EXISTS slots_filled INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'none'
    CHECK (payment_status IN ('none','pending','paid')),
  ADD COLUMN IF NOT EXISTS payment_amount_usd NUMERIC(6,2) DEFAULT 0;

-- ═══════════════════════════════════════════
-- 2. Click Tracking Table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS app_link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES app_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_clicks_submission ON app_link_clicks(submission_id);

ALTER TABLE app_link_clicks ENABLE ROW LEVEL SECURITY;

-- Only the app owner can read their app's clicks
CREATE POLICY "Owner can read their app clicks"
  ON app_link_clicks FOR SELECT
  USING (
    submission_id IN (
      SELECT id FROM app_submissions WHERE user_id = auth.uid()
    )
  );

-- Anyone (incl. anonymous via service role) can insert clicks
CREATE POLICY "Anyone can record a click"
  ON app_link_clicks FOR INSERT
  WITH CHECK (true);

-- ═══════════════════════════════════════════
-- 3. Atomic Slot-Fill Function
-- Increments slots_filled + feedback_count atomically.
-- Auto-closes submission when slots_filled reaches tester_slots.
-- Returns JSON with success flag.
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION fill_tester_slot(sub_id UUID)
RETURNS JSON AS $$
DECLARE
  v_filled INT;
  v_total  INT;
BEGIN
  UPDATE app_submissions
  SET
    slots_filled   = slots_filled + 1,
    feedback_count = feedback_count + 1,
    status = CASE
               WHEN slots_filled + 1 >= tester_slots THEN 'closed'
               ELSE status
             END
  WHERE id = sub_id
    AND status = 'active'
    AND slots_filled < tester_slots
  RETURNING slots_filled, tester_slots
  INTO v_filled, v_total;

  IF v_filled IS NULL THEN
    RETURN json_build_object('success', false, 'reason', 'slots_full_or_closed');
  END IF;

  RETURN json_build_object(
    'success',      true,
    'slots_filled', v_filled,
    'tester_slots', v_total,
    'is_full',      v_filled >= v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 4. Track App-Link Click
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION track_app_click(
  p_submission_id UUID,
  p_user_id       UUID    DEFAULT NULL,
  p_session       TEXT    DEFAULT NULL
) RETURNS void AS $$
  INSERT INTO app_link_clicks (submission_id, user_id, session_id)
  VALUES (p_submission_id, p_user_id, p_session);
$$ LANGUAGE sql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 5. Creator Stats Aggregation
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_submission_stats(p_submission_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'total_clicks',  COUNT(*),
    'unique_clicks', COUNT(DISTINCT COALESCE(user_id::TEXT, session_id))
  )
  FROM app_link_clicks
  WHERE submission_id = p_submission_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ═══════════════════════════════════════════
-- 6. Activate Paid Tier (call this after payment confirmed)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION activate_paid_tier(
  p_submission_id UUID,
  p_tier          TEXT,
  p_tester_slots  INT,
  p_amount_usd    NUMERIC
) RETURNS void AS $$
  UPDATE app_submissions
  SET
    tier               = p_tier,
    tester_slots       = p_tester_slots,
    payment_status     = 'paid',
    payment_amount_usd = p_amount_usd,
    updated_at         = now()
  WHERE id = p_submission_id;
$$ LANGUAGE sql SECURITY DEFINER;
