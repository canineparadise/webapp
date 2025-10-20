-- ============================================
-- COMPLETE ASSESSMENT SYSTEM SETUP
-- ============================================
-- Creates all tables needed for assessment booking system

-- 1. Create assessment_recurring_slots table (admin defines weekly recurring slots)
CREATE TABLE IF NOT EXISTS assessment_recurring_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 5=Friday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_dogs INTEGER NOT NULL DEFAULT 6,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create assessment_slots table (individual slot instances)
CREATE TABLE IF NOT EXISTS assessment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_dogs INTEGER NOT NULL DEFAULT 6,
  booked_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  recurring_slot_id UUID REFERENCES assessment_recurring_slots(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_date, start_time) -- Prevent duplicate slots
);

-- 3. Create assessment_bookings table (user bookings)
CREATE TABLE IF NOT EXISTS assessment_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES assessment_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slot_id, dog_id) -- Prevent same dog booked twice in same slot
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_slots_date ON assessment_slots(assessment_date);
CREATE INDEX IF NOT EXISTS idx_assessment_slots_available ON assessment_slots(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_assessment_bookings_slot ON assessment_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_assessment_bookings_user ON assessment_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_bookings_dog ON assessment_bookings(dog_id);

-- Enable RLS
ALTER TABLE assessment_recurring_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Everyone can view active recurring slots" ON assessment_recurring_slots;
DROP POLICY IF EXISTS "Admin can manage recurring slots" ON assessment_recurring_slots;
DROP POLICY IF EXISTS "Everyone can view available slots" ON assessment_slots;
DROP POLICY IF EXISTS "Admin can manage slots" ON assessment_slots;
DROP POLICY IF EXISTS "Users can view their bookings" ON assessment_bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON assessment_bookings;
DROP POLICY IF EXISTS "Admin can manage bookings" ON assessment_bookings;

-- RLS Policies for assessment_recurring_slots
CREATE POLICY "Everyone can view active recurring slots"
  ON assessment_recurring_slots FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage recurring slots"
  ON assessment_recurring_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- RLS Policies for assessment_slots
CREATE POLICY "Everyone can view available slots"
  ON assessment_slots FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admin can manage slots"
  ON assessment_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- RLS Policies for assessment_bookings
CREATE POLICY "Users can view their bookings"
  ON assessment_bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON assessment_bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can manage bookings"
  ON assessment_bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Insert some default recurring slots (Fridays 10am-12pm, 2pm-4pm)
INSERT INTO assessment_recurring_slots (day_of_week, start_time, end_time, max_dogs)
VALUES
  (5, '10:00', '12:00', 6),
  (5, '14:00', '16:00', 6)
ON CONFLICT DO NOTHING;

-- Function to generate assessment slots for next 4 weeks
CREATE OR REPLACE FUNCTION generate_assessment_slots()
RETURNS void AS $$
DECLARE
  recurring_slot RECORD;
  slot_date DATE;
  weeks_ahead INTEGER := 4;
BEGIN
  FOR recurring_slot IN
    SELECT * FROM assessment_recurring_slots WHERE is_active = true
  LOOP
    -- Generate slots for next 4 weeks
    FOR i IN 0..weeks_ahead LOOP
      slot_date := CURRENT_DATE + (i * 7) + (recurring_slot.day_of_week - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER);

      -- Only create if date is in future and doesn't exist
      IF slot_date >= CURRENT_DATE THEN
        INSERT INTO assessment_slots (
          assessment_date,
          start_time,
          end_time,
          max_dogs,
          recurring_slot_id,
          booked_count
        ) VALUES (
          slot_date,
          recurring_slot.start_time,
          recurring_slot.end_time,
          recurring_slot.max_dogs,
          recurring_slot.id,
          0
        )
        ON CONFLICT (assessment_date, start_time) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate initial slots
SELECT generate_assessment_slots();

-- Verify tables created
SELECT
  'assessment_recurring_slots' as table_name,
  COUNT(*) as record_count
FROM assessment_recurring_slots
UNION ALL
SELECT
  'assessment_slots',
  COUNT(*)
FROM assessment_slots
UNION ALL
SELECT
  'assessment_bookings',
  COUNT(*)
FROM assessment_bookings;

-- Show generated slots
SELECT
  id,
  assessment_date,
  start_time,
  end_time,
  max_dogs,
  booked_count,
  is_available
FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
ORDER BY assessment_date, start_time
LIMIT 10;
