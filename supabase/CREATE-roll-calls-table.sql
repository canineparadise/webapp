-- Create roll_calls table for tracking daily roll call (attendance checks)
-- This tracks which staff member conducted each roll call and timestamps

CREATE TABLE IF NOT EXISTS roll_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'in_progress', -- 'in_progress' or 'completed'
  conducted_by_staff_id UUID NOT NULL REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dogs_expected UUID[] DEFAULT '{}', -- Array of dog IDs expected
  dogs_present UUID[] DEFAULT '{}', -- Array of dog IDs actually present
  dogs_missing UUID[] DEFAULT '{}', -- Array of dog IDs that were missing
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_roll_calls_date ON roll_calls(date);
CREATE INDEX IF NOT EXISTS idx_roll_calls_staff ON roll_calls(conducted_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_roll_calls_status ON roll_calls(status);

-- Enable RLS
ALTER TABLE roll_calls ENABLE ROW LEVEL SECURITY;

-- Policy: Staff and admin can view all roll calls
CREATE POLICY "Staff and admin can view all roll calls"
  ON roll_calls
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Policy: Staff and admin can insert roll calls
CREATE POLICY "Staff and admin can insert roll calls"
  ON roll_calls
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Policy: Staff and admin can update roll calls
CREATE POLICY "Staff and admin can update roll calls"
  ON roll_calls
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Policy: Staff and admin can delete roll calls
CREATE POLICY "Staff and admin can delete roll calls"
  ON roll_calls
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_roll_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER roll_calls_updated_at
  BEFORE UPDATE ON roll_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_roll_calls_updated_at();

COMMENT ON TABLE roll_calls IS 'Tracks daily roll call attendance checks conducted by staff members';
COMMENT ON COLUMN roll_calls.conducted_by_staff_id IS 'Staff member who conducted this roll call';
COMMENT ON COLUMN roll_calls.status IS 'Status of roll call: in_progress or completed';
COMMENT ON COLUMN roll_calls.dogs_expected IS 'Array of dog IDs expected to be present';
COMMENT ON COLUMN roll_calls.dogs_present IS 'Array of dog IDs that were actually present';
COMMENT ON COLUMN roll_calls.dogs_missing IS 'Array of dog IDs that were missing from expected list';
COMMENT ON COLUMN roll_calls.started_at IS 'When the roll call was started';
COMMENT ON COLUMN roll_calls.completed_at IS 'When the roll call was completed';
