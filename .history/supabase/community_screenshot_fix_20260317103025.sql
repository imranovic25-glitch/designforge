-- ═══════════════════════════════════════════════════════════════════════
-- Community Screenshot Upload Fix
-- Run this in Supabase SQL Editor to fix screenshot upload permissions.
--
-- The original INSERT policy checked `auth.uid() = owner`, but the owner
-- column isn't populated at INSERT time in newer Supabase versions.
-- This migration recreates the policies with correct checks.
-- ═══════════════════════════════════════════════════════════════════════

-- 1) Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-screenshots', 'community-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Drop old policies and recreate with correct rules
DROP POLICY IF EXISTS "Public can read community screenshots"   ON storage.objects;
DROP POLICY IF EXISTS "Users can upload community screenshots"  ON storage.objects;
DROP POLICY IF EXISTS "Users can update own community screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own community screenshots" ON storage.objects;

-- Anyone can READ screenshots (bucket is public)
CREATE POLICY "Public can read community screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-screenshots');

-- Authenticated users can UPLOAD to the bucket
-- (Don't check owner here — it's auto-set by Supabase after INSERT)
CREATE POLICY "Users can upload community screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-screenshots'
    AND auth.role() = 'authenticated'
  );

-- Users can UPDATE their own screenshots
CREATE POLICY "Users can update own community screenshots"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'community-screenshots'
    AND auth.uid() = owner
  )
  WITH CHECK (
    bucket_id = 'community-screenshots'
    AND auth.uid() = owner
  );

-- Users can DELETE their own screenshots
CREATE POLICY "Users can delete own community screenshots"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'community-screenshots'
    AND auth.uid() = owner
  );
