-- Add 'free' as a valid payment_status for individual_day_bookings
-- This allows 100% discount codes to create free bookings

-- Drop the existing constraint
ALTER TABLE individual_day_bookings
  DROP CONSTRAINT IF EXISTS individual_day_bookings_payment_status_check;

-- Add the new constraint with 'free' included
ALTER TABLE individual_day_bookings
  ADD CONSTRAINT individual_day_bookings_payment_status_check
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'free'));
