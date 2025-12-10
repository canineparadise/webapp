-- ============================================
-- ADD CHECK-IN/OUT COLUMNS TO INDIVIDUAL_DAY_BOOKINGS
-- ============================================
-- The individual_day_bookings table is missing the check-in/out columns
-- that were only added to the bookings table

-- Add check-in/out columns to individual_day_bookings
ALTER TABLE individual_day_bookings
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_by UUID,
ADD COLUMN IF NOT EXISTS checked_out_by UUID,
ADD COLUMN IF NOT EXISTS staff_notes TEXT;

-- Also add meal columns if they don't exist
ALTER TABLE individual_day_bookings
ADD COLUMN IF NOT EXISTS needs_breakfast BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_lunch BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_dinner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS breakfast_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS breakfast_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS lunch_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lunch_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dinner_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dinner_completed_at TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'individual_day_bookings'
AND column_name IN ('checked_in', 'checked_out', 'checked_in_at', 'checked_out_at', 'checked_in_by', 'checked_out_by', 'needs_breakfast', 'needs_lunch', 'needs_dinner')
ORDER BY column_name;
