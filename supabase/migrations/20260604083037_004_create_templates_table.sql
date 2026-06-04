/*
  # Create templates table (replace file-based storage)

  1. New Tables
    - `templates`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, references auth.users, nullable — null means community template)
      - `title` (text, not null)
      - `canvas_data` (jsonb, not null, stores serialized fabric.js canvas)
      - `is_public` (boolean, default false — whether anyone can see it)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `templates` table
    - Authenticated users can view public templates + their own templates
    - Users can only insert their own templates
    - Users can only update their own templates
    - Users can only delete their own templates

  3. Indexes
    - Index on user_id for per-user queries
    - Index on is_public for public template listing

  4. Notes
    - `user_id` is nullable to support future admin-created community templates.
    - `is_public` defaults to false so templates are private by default.
*/

CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  canvas_data jsonb NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates or own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (is_public = true OR user_id = auth.uid());

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS templates_user_id_idx ON templates (user_id);
CREATE INDEX IF NOT EXISTS templates_public_idx ON templates (is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS templates_created_at_idx ON templates (created_at DESC);

DROP TRIGGER IF EXISTS templates_updated_at ON templates;
CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();