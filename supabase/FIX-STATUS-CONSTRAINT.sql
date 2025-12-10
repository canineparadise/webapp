-- ============================================
-- FIX STATUS CONSTRAINT FOR CHECK-IN
-- ============================================
-- The check-in function sets status = 'checked_in' but that
-- value wasn't in the allowed constraint list

-- Fix bookings table
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
CHECK (status IN ('confirmed', 'checked_in', 'cancelled', 'completed', 'no_show'));

-- Fix individual_day_bookings table
ALTER TABLE individual_day_bookings DROP CONSTRAINT IF EXISTS individual_day_bookings_status_check;
ALTER TABLE individual_day_bookings ADD CONSTRAINT individual_day_bookings_status_check
CHECK (status IN ('confirmed', 'checked_in', 'cancelled', 'completed', 'no_show'));

-- Verify constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname LIKE '%status_check%';
