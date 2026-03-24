-- Run this AFTER community_setup.sql
-- Adds: Community admins (bypass repo limits)

CREATE TABLE IF NOT EXISTS community_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE community_admins ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view the list (optional). For safety, block selects by default.
DROP POLICY IF EXISTS "No public read" ON community_admins;
CREATE POLICY "No public read"
  ON community_admins FOR SELECT
  USING (false);

-- Add admins via Supabase dashboard (Table Editor) using service role.

CREATE OR REPLACE FUNCTION is_community_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM community_admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
