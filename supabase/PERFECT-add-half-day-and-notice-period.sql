-- ============================================
-- CANINE PARADISE - HALF DAY & NOTICE PERIOD UPDATE (PERFECT)
-- ============================================
-- This migration is tailored to YOUR exact database structure
-- Based on actual table inspection
-- ============================================

-- Step 1: Add session_type enum (if not exists)
DO $$ BEGIN
  CREATE TYPE session_type AS ENUM ('full_day', 'half_day');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Update bookings table to support half-day sessions
-- Your bookings table has: dog_id (singular), check_in_time, check_out_time already
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS session_type session_type DEFAULT 'full_day';

-- Rename existing columns to match our new naming
ALTER TABLE bookings RENAME COLUMN check_in_time TO checked_in_at;
ALTER TABLE bookings RENAME COLUMN check_out_time TO checked_out_at;

-- Add new columns
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS session_start_time TIME DEFAULT '07:00',
ADD COLUMN IF NOT EXISTS session_end_time TIME DEFAULT '19:00',
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_out BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS checked_out_by UUID REFERENCES profiles(id);

-- Update checked_in/checked_out based on existing timestamp data
UPDATE bookings SET checked_in = true WHERE checked_in_at IS NOT NULL;
UPDATE bookings SET checked_out = true WHERE checked_out_at IS NOT NULL;

-- Step 3: Update subscriptions table for notice period tracking
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS cancellation_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancellation_effective_date DATE,
ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30;

-- Step 4: Update legal_agreements table to include notice period acceptance
ALTER TABLE legal_agreements
ADD COLUMN IF NOT EXISTS notice_period_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notice_period_accepted_at TIMESTAMPTZ;

-- Step 5: Create function to calculate cancellation charge
CREATE OR REPLACE FUNCTION calculate_cancellation_charge(subscription_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  sub_record RECORD;
  days_until_effective INTEGER;
  charge_amount DECIMAL;
BEGIN
  -- Get subscription details
  SELECT * INTO sub_record FROM subscriptions WHERE id = subscription_id;

  -- Calculate days until effective date
  days_until_effective := sub_record.cancellation_effective_date - CURRENT_DATE;

  -- If effective date is less than 30 days away, charge for one month
  IF days_until_effective < 30 THEN
    charge_amount := sub_record.monthly_price;
  ELSE
    charge_amount := 0;
  END IF;

  RETURN charge_amount;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create function to handle subscription cancellation with notice period
CREATE OR REPLACE FUNCTION request_subscription_cancellation(
  p_subscription_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
DECLARE
  sub_record RECORD;
  effective_date DATE;
  charge_amount DECIMAL;
  result JSON;
BEGIN
  -- Get subscription
  SELECT * INTO sub_record FROM subscriptions
  WHERE id = p_subscription_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Subscription not found'
    );
  END IF;

  -- Calculate effective cancellation date (30 days from now)
  effective_date := CURRENT_DATE + INTERVAL '30 days';

  -- Calculate if charge is needed
  charge_amount := sub_record.monthly_price;

  -- Update subscription
  UPDATE subscriptions SET
    cancellation_requested = true,
    cancellation_requested_at = NOW(),
    cancellation_effective_date = effective_date
  WHERE id = p_subscription_id;

  -- Build result
  result := json_build_object(
    'success', true,
    'effective_date', effective_date,
    'charge_amount', charge_amount,
    'message', 'Cancellation requested. You will be charged £' || charge_amount || ' for the notice period. Your subscription will end on ' || effective_date || '.'
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create check-in function
CREATE OR REPLACE FUNCTION check_in_dog(
  p_booking_id UUID,
  p_staff_id UUID
)
RETURNS JSON AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Get booking
  SELECT * INTO booking_record FROM bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF booking_record.checked_in THEN
    RETURN json_build_object('success', false, 'error', 'Already checked in');
  END IF;

  -- Update booking
  UPDATE bookings SET
    checked_in = true,
    checked_in_at = NOW(),
    checked_in_by = p_staff_id,
    status = 'confirmed'
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Dog checked in successfully',
    'checked_in_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create check-out function
CREATE OR REPLACE FUNCTION check_out_dog(
  p_booking_id UUID,
  p_staff_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Get booking
  SELECT * INTO booking_record FROM bookings WHERE id = p_booking_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Booking not found');
  END IF;

  IF NOT booking_record.checked_in THEN
    RETURN json_build_object('success', false, 'error', 'Dog not checked in yet');
  END IF;

  IF booking_record.checked_out THEN
    RETURN json_build_object('success', false, 'error', 'Already checked out');
  END IF;

  -- Update booking
  UPDATE bookings SET
    checked_out = true,
    checked_out_at = NOW(),
    checked_out_by = p_staff_id,
    staff_notes = COALESCE(p_notes, staff_notes),
    status = 'completed'
  WHERE id = p_booking_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Dog checked out successfully',
    'checked_out_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create view for today's check-in status
CREATE OR REPLACE VIEW todays_checkin_status AS
SELECT
  b.id AS booking_id,
  b.booking_date,
  b.session_type,
  b.session_start_time,
  b.session_end_time,
  b.checked_in,
  b.checked_out,
  b.checked_in_at,
  b.checked_out_at,
  b.dog_id,
  b.user_id,
  p.first_name || ' ' || p.last_name AS owner_name,
  p.phone AS owner_phone,
  p.email AS owner_email,
  CASE
    WHEN b.checked_out THEN 'Completed'
    WHEN b.checked_in THEN 'Present'
    ELSE 'Pending Check-In'
  END AS status
FROM bookings b
JOIN profiles p ON p.id = b.user_id
WHERE b.booking_date = CURRENT_DATE
  AND b.status IN ('pending', 'confirmed', 'completed')
ORDER BY b.session_start_time, b.checked_in_at NULLS FIRST;

-- Grant permissions
GRANT SELECT ON todays_checkin_status TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN bookings.session_type IS 'Full day (7am-7pm) or half day (10am-2pm)';
COMMENT ON COLUMN bookings.checked_in IS 'Whether dog has been checked in today';
COMMENT ON COLUMN bookings.checked_out IS 'Whether dog has been checked out today';
COMMENT ON COLUMN subscriptions.cancellation_requested IS 'User requested cancellation with notice period';
COMMENT ON COLUMN subscriptions.cancellation_effective_date IS 'Date when cancellation becomes effective (30 days from request)';
COMMENT ON COLUMN legal_agreements.notice_period_accepted IS 'User agreed to 30-day notice period for cancellation';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '✅ Added half-day session support';
  RAISE NOTICE '✅ Added notice period policy (30 days)';
  RAISE NOTICE '✅ Added check-in/check-out tracking';
  RAISE NOTICE '✅ Created helper functions for cancellation and check-in/out';
  RAISE NOTICE '';
  RAISE NOTICE 'NOTE: Your bookings table uses dog_id (singular) - one dog per booking';
  RAISE NOTICE 'NOTE: Half-day pricing is hardcoded in the frontend:';
  RAISE NOTICE '  - 4 days: £30/day (£120/month)';
  RAISE NOTICE '  - 8 days: £28.50/day (£228/month)';
  RAISE NOTICE '  - 12 days: £27.75/day (£333/month)';
  RAISE NOTICE '  - 16 days: £27/day (£432/month)';
  RAISE NOTICE '  - 20 days: £25/day (£500/month)';
END $$;
