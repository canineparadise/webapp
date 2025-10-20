-- Add meal options and special notes columns to bookings table
-- Run this script in your Supabase SQL Editor

-- Add meal requirement columns (boolean)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS needs_breakfast BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS needs_lunch BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS needs_dinner BOOLEAN DEFAULT FALSE;

-- Add special notes column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_notes TEXT;

-- Add comments to columns for documentation
COMMENT ON COLUMN bookings.needs_breakfast IS 'Indicates if the dog needs breakfast during daycare';
COMMENT ON COLUMN bookings.needs_lunch IS 'Indicates if the dog needs lunch during daycare';
COMMENT ON COLUMN bookings.needs_dinner IS 'Indicates if the dog needs dinner during daycare';
COMMENT ON COLUMN bookings.special_notes IS 'Special instructions or notes from the owner for staff';

-- Add index for querying bookings with meal requirements (optional but recommended for performance)
CREATE INDEX IF NOT EXISTS idx_bookings_meal_requirements ON bookings(booking_date)
WHERE needs_breakfast = TRUE OR needs_lunch = TRUE OR needs_dinner = TRUE;
