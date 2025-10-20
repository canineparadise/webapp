-- Create sections table for roll call areas
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sections_active ON sections(is_active);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(display_order);

-- Enable RLS
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view active sections" ON sections;
DROP POLICY IF EXISTS "Admin can manage sections" ON sections;

-- Policies: Everyone can view active sections
CREATE POLICY "Everyone can view active sections"
  ON sections FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policies: Only admin can insert, update, delete
CREATE POLICY "Admin can manage sections"
  ON sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert default sections
INSERT INTO sections (name, description, display_order) VALUES
  ('Playground 1', 'Main outdoor play area', 1),
  ('Playground 2', 'Secondary outdoor area', 2),
  ('Inside Area', 'Indoor climate-controlled space', 3),
  ('Training Area', 'Designated training and learning zone', 4),
  ('Rest Area', 'Quiet rest and nap area', 5),
  ('Main Hall', 'Central gathering area', 6)
ON CONFLICT (name) DO NOTHING;

-- Verify creation
SELECT * FROM sections ORDER BY display_order;
