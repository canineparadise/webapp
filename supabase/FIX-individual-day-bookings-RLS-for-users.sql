-- Fix RLS policies for individual_day_bookings to allow users to see their OWN bookings
-- This fixes Sarah Dobson and other clients not being able to see their individual day bookings

-- Drop any existing user policy to avoid conflicts
DROP POLICY IF EXISTS "Users can view own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can view own individual_day_bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "user_view_individual_day_bookings" ON individual_day_bookings;

-- Create policy allowing users to see their own bookings
CREATE POLICY "Users can view own individual_day_bookings" ON individual_day_bookings
  FOR SELECT
  USING (user_id = auth.uid());

-- Also ensure users can insert their own bookings
DROP POLICY IF EXISTS "Users can insert own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can insert own individual_day_bookings" ON individual_day_bookings;

CREATE POLICY "Users can insert own individual_day_bookings" ON individual_day_bookings
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users should be able to update their own bookings (for cancellations)
DROP POLICY IF EXISTS "Users can update own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can update own individual_day_bookings" ON individual_day_bookings;

CREATE POLICY "Users can update own individual_day_bookings" ON individual_day_bookings
  FOR UPDATE
  USING (user_id = auth.uid());

-- Verify RLS is enabled
ALTER TABLE individual_day_bookings ENABLE ROW LEVEL SECURITY;
