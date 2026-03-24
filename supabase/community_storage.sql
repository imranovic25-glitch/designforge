-- Run this in Supabase SQL Editor to enable screenshot uploads
-- Creates a public bucket + policies for authenticated uploads

-- 1) Create bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-screenshots', 'community-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Storage policies
-- Note: storage.objects RLS is enabled by default in Supabase.

-- Public can read screenshots
DROP POLICY IF EXISTS "Public can read community screenshots" ON storage.objects;
CREATE POLICY "Public can read community screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'community-screenshots');

-- Auth users can upload (only as owner) to the bucket
DROP POLICY IF EXISTS "Users can upload community screenshots" ON storage.objects;
CREATE POLICY "Users can upload community screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'community-screenshots'
    AND auth.uid() = owner
  );

-- Auth users can update/delete their own screenshots
DROP POLICY IF EXISTS "Users can update own community screenshots" ON storage.objects;
CREATE POLICY "Users can update own community screenshots"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'community-screenshots' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'community-screenshots' AND auth.uid() = owner);

DROP POLICY IF EXISTS "Users can delete own community screenshots" ON storage.objects;
CREATE POLICY "Users can delete own community screenshots"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'community-screenshots' AND auth.uid() = owner);
