-- Fix RLS policies for individual_day_bookings to ensure staff can see all bookings
-- This ensures Watson and Cleo's bookings show up in the staff dashboard

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Staff can view all bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can view all individual_day_bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "staff_view_individual_day_bookings" ON individual_day_bookings;

-- Recreate the staff view policy
CREATE POLICY "Staff can view all individual_day_bookings" ON individual_day_bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Ensure staff can also update bookings (for check-in/out)
DROP POLICY IF EXISTS "Staff can update bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can update individual_day_bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "staff_update_individual_day_bookings" ON individual_day_bookings;

CREATE POLICY "Staff can update individual_day_bookings" ON individual_day_bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Verify RLS is enabled
ALTER TABLE individual_day_bookings ENABLE ROW LEVEL SECURITY;
