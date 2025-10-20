-- Step 1: Create the roll_calls table
CREATE TABLE IF NOT EXISTS roll_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'in_progress',
  conducted_by_staff_id UUID NOT NULL REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dogs_expected UUID[],
  dogs_present UUID[],
  dogs_missing UUID[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX idx_roll_calls_date ON roll_calls(date);
CREATE INDEX idx_roll_calls_staff ON roll_calls(conducted_by_staff_id);
CREATE INDEX idx_roll_calls_status ON roll_calls(status);

-- Step 3: Enable RLS
ALTER TABLE roll_calls ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist
DROP POLICY IF EXISTS "Staff and admin can view all roll calls" ON roll_calls;
DROP POLICY IF EXISTS "Staff and admin can insert roll calls" ON roll_calls;
DROP POLICY IF EXISTS "Staff and admin can update roll calls" ON roll_calls;
DROP POLICY IF EXISTS "Staff and admin can delete roll calls" ON roll_calls;

-- Step 5: Create policies
CREATE POLICY "Staff and admin can view all roll calls"
  ON roll_calls FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff and admin can insert roll calls"
  ON roll_calls FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff and admin can update roll calls"
  ON roll_calls FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff and admin can delete roll calls"
  ON roll_calls FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );
