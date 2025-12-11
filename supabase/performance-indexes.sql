-- ============================================
-- Performance indexes for common queries
-- Run these in Supabase SQL editor
-- ============================================

-- Bookings filtered by user/date/status
CREATE INDEX IF NOT EXISTS idx_bookings_user_date_status
  ON bookings(user_id, booking_date DESC, status);

-- Individual day bookings filtered by user/date
CREATE INDEX IF NOT EXISTS idx_individual_day_bookings_user_date
  ON individual_day_bookings(user_id, booking_date DESC);

-- Active subscriptions by user
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON subscriptions(user_id, is_active) WHERE is_active = true;

-- Assessment bookings by user/status (supports either payment_status or booking_status)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_bookings' AND column_name = 'payment_status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_assessment_bookings_user_payment
      ON assessment_bookings(user_id, payment_status);
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessment_bookings' AND column_name = 'booking_status'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_assessment_bookings_user_booking_status
      ON assessment_bookings(user_id, booking_status);
  END IF;
END $$;

