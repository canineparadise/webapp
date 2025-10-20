-- Add staff tracking and meal completion columns to bookings table
-- Run this script in your Supabase SQL Editor

-- Add columns to track which staff member performed each action
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_by_staff_id UUID REFERENCES profiles(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_out_by_staff_id UUID REFERENCES profiles(id);

-- Add columns to track meal completion
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS breakfast_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS breakfast_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS breakfast_completed_by_staff_id UUID REFERENCES profiles(id);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lunch_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lunch_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS lunch_completed_by_staff_id UUID REFERENCES profiles(id);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dinner_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dinner_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dinner_completed_by_staff_id UUID REFERENCES profiles(id);

-- Add comments for documentation
COMMENT ON COLUMN bookings.checked_in_by_staff_id IS 'Staff member who checked in the dog';
COMMENT ON COLUMN bookings.checked_out_by_staff_id IS 'Staff member who checked out the dog';

COMMENT ON COLUMN bookings.breakfast_completed IS 'Whether breakfast has been given';
COMMENT ON COLUMN bookings.breakfast_completed_at IS 'When breakfast was completed';
COMMENT ON COLUMN bookings.breakfast_completed_by_staff_id IS 'Staff member who fed breakfast';

COMMENT ON COLUMN bookings.lunch_completed IS 'Whether lunch has been given';
COMMENT ON COLUMN bookings.lunch_completed_at IS 'When lunch was completed';
COMMENT ON COLUMN bookings.lunch_completed_by_staff_id IS 'Staff member who fed lunch';

COMMENT ON COLUMN bookings.dinner_completed IS 'Whether dinner has been given';
COMMENT ON COLUMN bookings.dinner_completed_at IS 'When dinner was completed';
COMMENT ON COLUMN bookings.dinner_completed_by_staff_id IS 'Staff member who fed dinner';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_checked_in_by_staff ON bookings(checked_in_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_checked_out_by_staff ON bookings(checked_out_by_staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_meal_staff ON bookings(breakfast_completed_by_staff_id, lunch_completed_by_staff_id, dinner_completed_by_staff_id);
