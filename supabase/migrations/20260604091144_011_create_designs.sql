/*
  # Create designs table

  1. New Tables
    - `designs`
      - id (uuid, PK, default gen_random_uuid())
      - user_id (uuid, NOT NULL, FK -> auth.users)
      - title (text, NOT NULL, default 'Untitled Design')
      - canvas_width (integer, NOT NULL, default 1080)
      - canvas_height (integer, NOT NULL, default 1080)
      - canvas_background (text, NOT NULL, default '#ffffff')
      - created_at (timestamptz, default now())
      - updated_at (timestamptz, default now())

  2. Security
    - RLS enabled
    - Users can only CRUD their own designs

  3. Indexes
    - designs_user_id_idx on user_id
    - designs_updated_at_idx on updated_at DESC
*/

CREATE TABLE IF NOT EXISTS designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled Design',
  canvas_width integer NOT NULL DEFAULT 1080,
  canvas_height integer NOT NULL DEFAULT 1080,
  canvas_background text NOT NULL DEFAULT '#ffffff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs"
  ON designs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own designs"
  ON designs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own designs"
  ON designs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own designs"
  ON designs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS designs_user_id_idx ON designs (user_id);
CREATE INDEX IF NOT EXISTS designs_updated_at_idx ON designs (updated_at DESC);

DROP TRIGGER IF EXISTS designs_updated_at ON designs;
CREATE TRIGGER designs_updated_at
  BEFORE UPDATE ON designs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();