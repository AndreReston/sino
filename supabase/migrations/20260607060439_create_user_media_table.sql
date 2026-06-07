/*
# Create user_media table

1. New Tables
- `user_media`
- `id` (uuid, primary key)
- `user_id` (uuid, not null, references auth.users, defaults to auth.uid())
- `name` (text, not null) - original file name
- `url` (text, not null) - path to the file in uploads
- `type` (text, not null) - 'image' or 'video'
- `thumbnail_url` (text, nullable) - video thumbnail data URL
- `duration` (numeric, nullable) - video duration in seconds
- `created_at` (timestamptz, defaults to now())

2. Security
- Enable RLS on `user_media`.
- Owner-scoped CRUD: each authenticated user can only access their own uploaded media.
*/

CREATE TABLE IF NOT EXISTS user_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video')),
  thumbnail_url text,
  duration numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_media" ON user_media;
CREATE POLICY "select_own_media" ON user_media FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_media" ON user_media;
CREATE POLICY "insert_own_media" ON user_media FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_media" ON user_media;
CREATE POLICY "update_own_media" ON user_media FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_media" ON user_media;
CREATE POLICY "delete_own_media" ON user_media FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_media_user_id ON user_media(user_id);