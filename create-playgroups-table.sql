-- Play Groups Table for organizing dogs during daycare
-- Run this in your Supabase SQL Editor

-- STEP 1: Add role column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin'));
    COMMENT ON COLUMN profiles.role IS 'User role: user (client), staff, or admin';
  END IF;
END $$;

-- STEP 2: Create play_groups table
CREATE TABLE IF NOT EXISTS play_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6', -- For visual identification
  icon TEXT DEFAULT '🐕', -- Emoji for fun identification
  max_dogs INTEGER DEFAULT 10,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dog_play_groups junction table (dogs can be in multiple groups)
CREATE TABLE IF NOT EXISTS dog_play_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  play_group_id UUID NOT NULL REFERENCES play_groups(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 1, -- Which group is preferred (1 = primary)
  notes TEXT, -- Specific notes for this dog in this group
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  UNIQUE(dog_id, play_group_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_play_groups_active ON play_groups(active);
CREATE INDEX IF NOT EXISTS idx_dog_play_groups_dog ON dog_play_groups(dog_id);
CREATE INDEX IF NOT EXISTS idx_dog_play_groups_group ON dog_play_groups(play_group_id);

-- Enable Row Level Security
ALTER TABLE play_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_play_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for play_groups
DROP POLICY IF EXISTS "Admins and staff can view play groups" ON play_groups;
CREATE POLICY "Admins and staff can view play groups" ON play_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Admins can manage play groups" ON play_groups;
CREATE POLICY "Admins can manage play groups" ON play_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for dog_play_groups
DROP POLICY IF EXISTS "Admins and staff can view dog play groups" ON dog_play_groups;
CREATE POLICY "Admins and staff can view dog play groups" ON dog_play_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

DROP POLICY IF EXISTS "Admins can manage dog play groups" ON dog_play_groups;
CREATE POLICY "Admins can manage dog play groups" ON dog_play_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert some example play groups (optional)
INSERT INTO play_groups (name, description, color, icon, max_dogs, notes) VALUES
  ('Big Dogs Morning', 'High-energy large dogs for morning play', '#10b981', '🦮', 8, 'Keep groups small for safety'),
  ('Small Dogs Group', 'Small breeds under 15kg', '#f59e0b', '🐕‍🦺', 12, 'Gentle play, watch for larger dogs'),
  ('Puppies & Young Dogs', 'Under 1 year old, socialization focused', '#ec4899', '🐕', 6, 'Short play sessions, lots of breaks'),
  ('Senior Dogs', 'Calm, older dogs 7+ years', '#8b5cf6', '🦴', 10, 'Gentle exercise, comfortable rest areas'),
  ('High Energy Group', 'Very active dogs needing intense exercise', '#ef4444', '⚡', 6, 'Long play sessions, agility activities');

COMMENT ON TABLE play_groups IS 'Play groups for organizing dogs during daycare sessions';
COMMENT ON TABLE dog_play_groups IS 'Junction table linking dogs to their assigned play groups';
