-- ═══════════════════════════════════════════════════════════════════════
-- Community Screenshot Upload Fix  (run in Supabase SQL Editor)
--
-- FIX: The original INSERT policy checked `auth.uid() = owner`, but the
-- `owner` column is only set AFTER the row is inserted, so INSERT always
-- failed.  The new policy just checks that the user is authenticated.
-- ═══════════════════════════════════════════════════════════════════════

-- 1) Ensure bucket exists (public-read so getPublicUrl works)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-screenshots',
  'community-screenshots',
  true,
  5242880,  -- 5 MB max per file
  ARRAY['image/png','image/jpeg','image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) Drop ALL old policies (safe to run even if they don't exist)
DROP POLICY IF EXISTS "Public can read community screenshots"        ON storage.objects;
DROP POLICY IF EXISTS "Users can upload community screenshots"       ON storage.objects;
DROP POLICY IF EXISTS "Users can update own community screenshots"   ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own community screenshots"   ON storage.objects;

-- 3) Anyone can READ (bucket is public)
CREATE POLICY "Public can read community screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-screenshots');

-- 4) Authenticated users can INSERT (DO NOT check `owner` here)
CREATE POLICY "Users can upload community screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-screenshots'
    AND (auth.role()) = 'authenticated'
  );

-- 5) Users can UPDATE their own uploads
CREATE POLICY "Users can update own community screenshots"
  ON storage.objects FOR UPDATE
  USING  (bucket_id = 'community-screenshots' AND (select auth.uid()) = owner)
  WITH CHECK (bucket_id = 'community-screenshots' AND (select auth.uid()) = owner);

-- 6) Users can DELETE their own uploads
CREATE POLICY "Users can delete own community screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-screenshots' AND (select auth.uid()) = owner);
