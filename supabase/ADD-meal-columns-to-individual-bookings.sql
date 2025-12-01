-- ============================================
-- ADD MEAL COLUMNS TO INDIVIDUAL_DAY_BOOKINGS
-- ============================================

-- Add meal requirement columns
ALTER TABLE individual_day_bookings
ADD COLUMN IF NOT EXISTS needs_breakfast BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_lunch BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_dinner BOOLEAN DEFAULT false;

-- Add meal completion tracking columns
ALTER TABLE individual_day_bookings
ADD COLUMN IF NOT EXISTS breakfast_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS breakfast_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS breakfast_completed_by_staff_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS lunch_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lunch_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS lunch_completed_by_staff_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS dinner_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dinner_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS dinner_completed_by_staff_id UUID REFERENCES profiles(id);

-- Add special notes column if it doesn't exist
ALTER TABLE individual_day_bookings
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'individual_day_bookings'
  AND column_name IN ('needs_breakfast', 'needs_lunch', 'needs_dinner', 'special_instructions',
                      'breakfast_completed', 'lunch_completed', 'dinner_completed')
ORDER BY column_name;
