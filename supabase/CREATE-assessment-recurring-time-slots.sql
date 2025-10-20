-- =====================================================
-- ASSESSMENT RECURRING TIME SLOTS TABLE
-- This table stores the RECURRING weekly time slots that admin configures
-- (NOT individual bookings - those are in assessment_slots + assessment_bookings)
-- =====================================================

-- Create table for recurring weekly assessment time slots
CREATE TABLE IF NOT EXISTS assessment_recurring_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week, start_time, end_time)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_assessment_recurring_slots_day ON assessment_recurring_slots(day_of_week) WHERE is_active = true;

-- Enable RLS
ALTER TABLE assessment_recurring_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view active slots
CREATE POLICY "Anyone can view active recurring slots"
ON assessment_recurring_slots FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy: Only admin can insert/update/delete
CREATE POLICY "Only admin can manage recurring slots"
ON assessment_recurring_slots FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert example slots (Friday)
INSERT INTO assessment_recurring_slots (day_of_week, start_time, end_time)
VALUES
  (5, '09:00', '12:00'),  -- Friday 9am-12pm
  (5, '13:00', '16:00'),  -- Friday 1pm-4pm
  (1, '10:00', '13:00')   -- Monday 10am-1pm
ON CONFLICT DO NOTHING;

-- Verify
SELECT
  CASE day_of_week
    WHEN 0 THEN 'Sunday'
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday'
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
  END as day_name,
  day_of_week,
  start_time,
  end_time,
  is_active,
  created_at
FROM assessment_recurring_slots
ORDER BY day_of_week, start_time;
