-- Run AFTER community_setup.sql and community_repos.sql
-- Allows community admins to delete any submission (for testing cleanup)

-- Drop existing owner-only delete policy and replace with one that also allows admins
DROP POLICY IF EXISTS "Users can delete their own submissions" ON app_submissions;

CREATE POLICY "Users can delete their own submissions"
  ON app_submissions FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM community_admins WHERE user_id = auth.uid())
  );
