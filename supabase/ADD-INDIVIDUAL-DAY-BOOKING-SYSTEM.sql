-- ============================================
-- INDIVIDUAL DAY BOOKING SYSTEM
-- ============================================
-- This script adds:
-- 1. Individual day bookings table
-- 2. Daily capacity management
-- 3. Admin pricing settings
-- 4. Real-time capacity checking functions
-- ============================================

-- 1. CREATE ADMIN_SETTINGS TABLE (if it doesn't exist)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
DROP POLICY IF EXISTS "Admin can manage settings" ON admin_settings;
DROP POLICY IF EXISTS "Staff can view settings" ON admin_settings;

CREATE POLICY "Admin can manage settings" ON admin_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Staff can view settings" ON admin_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Insert default pricing settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('assessment_fee', '40', 'number', 'Assessment fee per dog (£)'),
  ('individual_day_price', '50', 'number', 'Price for individual day booking (£)'),
  ('daily_capacity_large', '30', 'number', 'Daily capacity for large/medium dogs'),
  ('daily_capacity_small', '20', 'number', 'Daily capacity for small dogs'),
  ('enable_individual_bookings', 'true', 'boolean', 'Enable individual day bookings')
ON CONFLICT (setting_key) DO NOTHING;

-- 2. CREATE INDIVIDUAL_DAY_BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS individual_day_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  dog_size TEXT CHECK (dog_size IN ('small', 'medium', 'large')),
  price DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal')),
  stripe_session_id TEXT,
  paypal_order_id TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent double booking same dog on same day
  UNIQUE(dog_id, booking_date)
);

-- Enable RLS
ALTER TABLE individual_day_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Admin can manage all bookings" ON individual_day_bookings;

CREATE POLICY "Users can view own bookings" ON individual_day_bookings
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings" ON individual_day_bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff can view all bookings" ON individual_day_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can update bookings" ON individual_day_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admin can manage all bookings" ON individual_day_bookings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_individual_bookings_date ON individual_day_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_individual_bookings_user ON individual_day_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_bookings_dog ON individual_day_bookings(dog_id);
CREATE INDEX IF NOT EXISTS idx_individual_bookings_status ON individual_day_bookings(status);

-- 3. CREATE FUNCTION TO CHECK DAILY CAPACITY
-- ============================================
CREATE OR REPLACE FUNCTION check_daily_capacity(
  p_date DATE,
  p_dog_size TEXT
)
RETURNS JSON AS $$
DECLARE
  v_capacity INTEGER;
  v_current_bookings INTEGER;
  v_available INTEGER;
  v_size_category TEXT;
BEGIN
  -- Determine size category (small dogs separate, medium/large together)
  IF p_dog_size = 'small' THEN
    v_size_category := 'small';

    -- Get small dog capacity
    SELECT COALESCE(setting_value::INTEGER, 20)
    INTO v_capacity
    FROM admin_settings
    WHERE setting_key = 'daily_capacity_small';

  ELSE
    v_size_category := 'large'; -- medium and large together

    -- Get large/medium dog capacity
    SELECT COALESCE(setting_value::INTEGER, 30)
    INTO v_capacity
    FROM admin_settings
    WHERE setting_key = 'daily_capacity_large';
  END IF;

  -- Count current confirmed bookings for this date and size
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM individual_day_bookings
  WHERE booking_date = p_date
    AND status = 'confirmed'
    AND (
      (v_size_category = 'small' AND dog_size = 'small')
      OR
      (v_size_category = 'large' AND dog_size IN ('medium', 'large'))
    );

  -- Calculate available spots
  v_available := v_capacity - v_current_bookings;

  RETURN json_build_object(
    'date', p_date,
    'size_category', v_size_category,
    'total_capacity', v_capacity,
    'current_bookings', v_current_bookings,
    'available_spots', v_available,
    'is_available', v_available > 0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE FUNCTION TO GET AVAILABILITY FOR DATE RANGE
-- ============================================
CREATE OR REPLACE FUNCTION get_date_range_availability(
  p_start_date DATE,
  p_end_date DATE,
  p_dog_size TEXT
)
RETURNS TABLE (
  booking_date DATE,
  available_spots INTEGER,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE date_series AS (
    SELECT p_start_date::DATE AS d
    UNION ALL
    SELECT (d + INTERVAL '1 day')::DATE
    FROM date_series
    WHERE d < p_end_date
  ),
  capacities AS (
    SELECT
      ds.d as booking_date,
      (check_daily_capacity(ds.d, p_dog_size)->>'available_spots')::INTEGER as available_spots,
      (check_daily_capacity(ds.d, p_dog_size)->>'is_available')::BOOLEAN as is_available
    FROM date_series ds
  )
  SELECT * FROM capacities;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE TRIGGER TO UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_individual_day_bookings_updated_at ON individual_day_bookings;
CREATE TRIGGER update_individual_day_bookings_updated_at
  BEFORE UPDATE ON individual_day_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_settings_updated_at ON admin_settings;
CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. GRANT PERMISSIONS
-- ============================================
GRANT SELECT ON admin_settings TO authenticated;
GRANT ALL ON individual_day_bookings TO authenticated;
GRANT EXECUTE ON FUNCTION check_daily_capacity TO authenticated;
GRANT EXECUTE ON FUNCTION get_date_range_availability TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check admin_settings
SELECT * FROM admin_settings WHERE setting_key LIKE '%price%' OR setting_key LIKE '%capacity%';

-- Test capacity function
SELECT check_daily_capacity(CURRENT_DATE, 'small');
SELECT check_daily_capacity(CURRENT_DATE, 'large');

-- Test date range availability
SELECT * FROM get_date_range_availability(
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  'small'
);

-- ============================================
-- COMPLETE!
-- ============================================
-- Run this script in your Supabase SQL Editor
-- Then test the capacity functions work correctly
-- ============================================
