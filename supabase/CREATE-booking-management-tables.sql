-- ============================================
-- BOOKING CREDITS TABLE
-- Tracks credits when users cancel individual day bookings
-- ============================================

CREATE TABLE IF NOT EXISTS booking_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL, -- Credit amount in GBP
  original_booking_id UUID, -- Reference to cancelled booking (if from individual_day_bookings)
  original_booking_date DATE,
  reason TEXT, -- e.g., "Cancelled booking for 2025-11-30"
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_for_booking_id UUID, -- Reference to booking where credit was used
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = never expires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_credits_user_id ON booking_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_credits_is_used ON booking_credits(is_used);

-- Add RLS policies
ALTER TABLE booking_credits ENABLE ROW LEVEL SECURITY;

-- Users can view their own credits
CREATE POLICY "Users can view own credits"
  ON booking_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credits (when cancelling)
CREATE POLICY "Users can create own credits"
  ON booking_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credits (when using them)
CREATE POLICY "Users can update own credits"
  ON booking_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Staff and admins can view all credits
CREATE POLICY "Staff can view all credits"
  ON booking_credits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- ============================================
-- REFUND REQUESTS TABLE
-- Tracks refund requests from cancelled individual day bookings
-- ============================================

CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID, -- Reference to cancelled booking
  booking_type TEXT NOT NULL, -- 'individual_day' or 'subscription'
  booking_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Amount to refund
  dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
  payment_method TEXT, -- 'stripe', 'paypal', etc.
  payment_transaction_id TEXT, -- Original payment ID
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  reason TEXT, -- User's reason for cancellation
  admin_notes TEXT, -- Admin notes about the refund
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_booking_date ON refund_requests(booking_date);

-- Add RLS policies
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own refund requests
CREATE POLICY "Users can view own refund requests"
  ON refund_requests FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own refund requests
CREATE POLICY "Users can create own refund requests"
  ON refund_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Staff and admins can view all refund requests
CREATE POLICY "Staff can view all refund requests"
  ON refund_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Staff and admins can update refund requests
CREATE POLICY "Staff can update refund requests"
  ON refund_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- ============================================
-- UPDATE EXISTING BOOKINGS TABLES
-- Add cancellation tracking fields
-- ============================================

-- Add cancellation fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_status TEXT; -- 'none', 'requested', 'approved', 'completed', 'credited'

-- Add cancellation fields to individual_day_bookings table
ALTER TABLE individual_day_bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE individual_day_bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE individual_day_bookings ADD COLUMN IF NOT EXISTS refund_status TEXT; -- 'none', 'requested', 'approved', 'completed', 'credited'

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if booking can be cancelled (24hr policy)
CREATE OR REPLACE FUNCTION can_cancel_booking(p_booking_date DATE)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if booking is more than 24 hours away
  RETURN p_booking_date > CURRENT_DATE + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total available credits
CREATE OR REPLACE FUNCTION get_user_available_credits(p_user_id UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  total_credits DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_credits
  FROM booking_credits
  WHERE user_id = p_user_id
  AND is_used = FALSE
  AND (expires_at IS NULL OR expires_at > NOW());

  RETURN total_credits;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION can_cancel_booking(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_available_credits(UUID) TO authenticated;
