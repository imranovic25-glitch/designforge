-- Community setup for DesignForge360
-- Run this entire file in Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- App submissions
CREATE TABLE IF NOT EXISTS app_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  app_url TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('android','ios','web','desktop','cross-platform')),
  category TEXT NOT NULL CHECK (category IN ('productivity','social','finance','games','education','health','utility','entertainment','developer-tools','other')),
  screenshot_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','closed')),
  upvotes INT DEFAULT 0,
  feedback_count INT DEFAULT 0,
  user_name TEXT,
  user_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_submissions_created ON app_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_submissions_platform ON app_submissions(platform);
CREATE INDEX IF NOT EXISTS idx_app_submissions_category ON app_submissions(category);
CREATE INDEX IF NOT EXISTS idx_app_submissions_user ON app_submissions(user_id);

ALTER TABLE app_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Submissions are publicly readable" ON app_submissions;
DROP POLICY IF EXISTS "Users can insert their own submissions" ON app_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON app_submissions;
DROP POLICY IF EXISTS "Users can delete their own submissions" ON app_submissions;

CREATE POLICY "Submissions are publicly readable"
  ON app_submissions FOR SELECT USING (true);

CREATE POLICY "Users can insert their own submissions"
  ON app_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON app_submissions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON app_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- App feedback
CREATE TABLE IF NOT EXISTS app_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES app_submissions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT NOT NULL CHECK (char_length(feedback_text) BETWEEN 10 AND 2000),
  areas TEXT[] DEFAULT '{}',
  device_info TEXT CHECK (device_info IS NULL OR char_length(device_info) <= 100),
  user_name TEXT,
  user_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_app_feedback_submission ON app_feedback(submission_id);

ALTER TABLE app_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Feedback is publicly readable" ON app_feedback;
DROP POLICY IF EXISTS "Users can insert their own feedback" ON app_feedback;
DROP POLICY IF EXISTS "Users can update their own feedback" ON app_feedback;
DROP POLICY IF EXISTS "Users can delete their own feedback" ON app_feedback;

CREATE POLICY "Feedback is publicly readable"
  ON app_feedback FOR SELECT USING (true);

CREATE POLICY "Users can insert their own feedback"
  ON app_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON app_feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON app_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- App upvotes
CREATE TABLE IF NOT EXISTS app_upvotes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES app_submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, submission_id)
);

ALTER TABLE app_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Upvotes are publicly readable" ON app_upvotes;
DROP POLICY IF EXISTS "Users can insert their own upvotes" ON app_upvotes;
DROP POLICY IF EXISTS "Users can delete their own upvotes" ON app_upvotes;

CREATE POLICY "Upvotes are publicly readable"
  ON app_upvotes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own upvotes"
  ON app_upvotes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes"
  ON app_upvotes FOR DELETE
  USING (auth.uid() = user_id);

-- RPC helpers for atomic counters
CREATE OR REPLACE FUNCTION increment_feedback_count(row_id UUID)
RETURNS void AS $$
  UPDATE app_submissions
  SET feedback_count = feedback_count + 1
  WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_feedback_count(row_id UUID)
RETURNS void AS $$
  UPDATE app_submissions
  SET feedback_count = GREATEST(feedback_count - 1, 0)
  WHERE id = row_id;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_upvotes(row_id UUID)
RETURNS INT AS $$
  UPDATE app_submissions
  SET upvotes = upvotes + 1
  WHERE id = row_id
  RETURNING upvotes;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_upvotes(row_id UUID)
RETURNS INT AS $$
  UPDATE app_submissions
  SET upvotes = GREATEST(upvotes - 1, 0)
  WHERE id = row_id
  RETURNING upvotes;
$$ LANGUAGE sql SECURITY DEFINER;
