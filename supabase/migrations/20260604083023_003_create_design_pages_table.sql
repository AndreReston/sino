/*
  # Create design_pages table

  1. New Tables
    - `design_pages`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `design_id` (uuid, not null, references designs, cascade delete)
      - `page_order` (integer, not null, default 0)
      - `canvas_data` (jsonb, nullable, stores serialized fabric.js canvas)
      - `thumbnail` (text, nullable, base64 thumbnail data URL)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `design_pages` table
    - Users can only view pages of their own designs
    - Users can only insert pages for their own designs
    - Users can only update pages of their own designs
    - Users can only delete pages of their own designs

  3. Indexes
    - Index on design_id for fast page lookups
    - Composite unique on (design_id, page_order) to prevent ordering conflicts

  4. Notes
    - When a design is deleted, all its pages cascade-delete automatically
      thanks to the foreign key with ON DELETE CASCADE.
*/

CREATE TABLE IF NOT EXISTS design_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
  page_order integer NOT NULL DEFAULT 0,
  canvas_data jsonb,
  thumbnail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE design_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own design pages"
  ON design_pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_pages.design_id
      AND designs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own design pages"
  ON design_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_pages.design_id
      AND designs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own design pages"
  ON design_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_pages.design_id
      AND designs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_pages.design_id
      AND designs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own design pages"
  ON design_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM designs
      WHERE designs.id = design_pages.design_id
      AND designs.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS design_pages_design_id_idx ON design_pages (design_id);
CREATE INDEX IF NOT EXISTS design_pages_order_idx ON design_pages (design_id, page_order);

DROP TRIGGER IF EXISTS design_pages_updated_at ON design_pages;
CREATE TRIGGER design_pages_updated_at
  BEFORE UPDATE ON design_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();