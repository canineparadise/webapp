-- ============================================
-- COMPLETE NEW FEATURES DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ASSESSMENT SLOTS SYSTEM
-- ============================================

-- Create assessment_slots table
CREATE TABLE IF NOT EXISTS assessment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_dogs INTEGER DEFAULT 1,
  booked_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_slot_times CHECK (end_time > start_time),
  CONSTRAINT valid_booked_count CHECK (booked_count <= max_dogs)
);

-- Create assessment_bookings table (links dogs to slots)
CREATE TABLE IF NOT EXISTS assessment_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES assessment_slots(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'completed', 'cancelled', 'no_show')),
  booked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(slot_id, dog_id)
);

-- Add assessment_slot_id to dogs table for tracking
ALTER TABLE dogs ADD COLUMN IF NOT EXISTS assessment_slot_id UUID REFERENCES assessment_slots(id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessment_slots_date ON assessment_slots(assessment_date);
CREATE INDEX IF NOT EXISTS idx_assessment_slots_available ON assessment_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_assessment_bookings_slot ON assessment_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_assessment_bookings_dog ON assessment_bookings(dog_id);

-- ============================================
-- 2. SUBSCRIPTION CANCELLATION SYSTEM
-- ============================================

-- Add cancellation fields to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_requested BOOLEAN DEFAULT FALSE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_reason_category TEXT;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancellation_effective_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30;

-- Add notice tracking
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS notice_given_date DATE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS notice_status TEXT CHECK (notice_status IN ('none', 'given', 'completed', 'withdrawn'));

-- ============================================
-- 3. STAFF PERMISSIONS SYSTEM
-- ============================================

-- Add role and permissions to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS staff_permissions JSONB DEFAULT '{}'::jsonb;

-- Example staff_permissions structure:
-- {
--   "can_view_today": true,
--   "can_check_in": true,
--   "can_check_out": true,
--   "can_approve_assessments": true,
--   "can_manage_playgroups": true,
--   "can_view_medications": true,
--   "can_feed_dogs": true,
--   "can_view_schedule": true,
--   "can_view_reports": false,
--   "can_manage_staff": false
-- }

-- ============================================
-- 4. ANALYTICS & REPORTING TABLES
-- ============================================

-- Create daily_stats table for tracking
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL UNIQUE,
  total_dogs_attended INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  new_subscriptions INTEGER DEFAULT 0,
  cancelled_subscriptions INTEGER DEFAULT 0,
  assessments_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_changes table for tracking history
CREATE TABLE IF NOT EXISTS subscription_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'upgraded', 'downgraded', 'cancelled', 'renewed', 'expired')),
  old_tier_id UUID REFERENCES subscription_tiers(id),
  new_tier_id UUID REFERENCES subscription_tiers(id),
  reason TEXT,
  change_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. COMMENTS AND INDEXES
-- ============================================

-- Assessment slots
COMMENT ON TABLE assessment_slots IS 'Available assessment time slots created by admin';
COMMENT ON COLUMN assessment_slots.max_dogs IS 'Maximum number of dogs that can be assessed in this slot';
COMMENT ON COLUMN assessment_slots.booked_count IS 'Current number of dogs booked for this slot';

-- Assessment bookings
COMMENT ON TABLE assessment_bookings IS 'Bookings linking dogs to assessment slots';

-- Subscription cancellations
COMMENT ON COLUMN subscriptions.cancellation_reason_category IS 'Category: price, moving, dog_behavior, service_quality, other';
COMMENT ON COLUMN subscriptions.notice_period_days IS 'Required notice period in days (default 30)';

-- Staff permissions
COMMENT ON COLUMN profiles.staff_permissions IS 'JSON object defining which features staff can access';

-- Daily stats
COMMENT ON TABLE daily_stats IS 'Daily aggregated statistics for reporting and graphs';

-- Subscription changes
COMMENT ON TABLE subscription_changes IS 'Historical log of all subscription modifications';

-- ============================================
-- 6. INDEXES FOR ANALYTICS PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_cancellation ON subscriptions(cancellation_requested, cancellation_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_notice ON subscriptions(notice_status, notice_given_date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_date ON subscription_changes(change_date DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_type ON subscription_changes(change_type);

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE assessment_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;

-- Assessment slots - Staff and Admin can view/manage
DROP POLICY IF EXISTS "Staff and admin can manage assessment slots" ON assessment_slots;
CREATE POLICY "Staff and admin can manage assessment slots"
ON assessment_slots FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Assessment slots - Users can view available slots
DROP POLICY IF EXISTS "Users can view available assessment slots" ON assessment_slots;
CREATE POLICY "Users can view available assessment slots"
ON assessment_slots FOR SELECT
TO authenticated
USING (is_available = TRUE);

-- Assessment bookings - Users can view own bookings
DROP POLICY IF EXISTS "Users can view own assessment bookings" ON assessment_bookings;
CREATE POLICY "Users can view own assessment bookings"
ON assessment_bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Assessment bookings - Users can create bookings
DROP POLICY IF EXISTS "Users can create assessment bookings" ON assessment_bookings;
CREATE POLICY "Users can create assessment bookings"
ON assessment_bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Daily stats - Admin only
DROP POLICY IF EXISTS "Admin can view daily stats" ON daily_stats;
CREATE POLICY "Admin can view daily stats"
ON daily_stats FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Subscription changes - Users can view their own
DROP POLICY IF EXISTS "Users can view own subscription changes" ON subscription_changes;
CREATE POLICY "Users can view own subscription changes"
ON subscription_changes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- VERIFICATION QUERIES (Run these to check)
-- ============================================

-- Check assessment_slots table
-- SELECT * FROM assessment_slots LIMIT 5;

-- Check new subscription columns
-- SELECT cancellation_requested, cancellation_reason, notice_status FROM subscriptions LIMIT 5;

-- Check profiles role and permissions
-- SELECT id, email, role, staff_permissions FROM profiles WHERE role IN ('staff', 'admin') LIMIT 5;

-- Check daily_stats table
-- SELECT * FROM daily_stats ORDER BY stat_date DESC LIMIT 10;
