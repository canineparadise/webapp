-- Fix RLS policies to allow staff to UPDATE bookings for check-in/check-out
-- This applies to BOTH bookings AND individual_day_bookings tables

-- ============================================
-- FIX BOOKINGS TABLE
-- ============================================
-- Drop existing UPDATE policies on bookings that might be blocking staff
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;

-- Allow authenticated users to UPDATE bookings (staff and admins need this for check-in/check-out)
CREATE POLICY "Authenticated users can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- FIX INDIVIDUAL_DAY_BOOKINGS TABLE
-- ============================================
-- Drop existing UPDATE policies on individual_day_bookings that might be blocking staff
DROP POLICY IF EXISTS "Users can update own individual day bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can update individual day bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Authenticated users can update individual day bookings" ON individual_day_bookings;

-- Allow authenticated users to UPDATE individual_day_bookings (staff and admins need this for check-in/check-out)
CREATE POLICY "Authenticated users can update individual day bookings"
ON individual_day_bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE (tablename = 'bookings' OR tablename = 'individual_day_bookings') AND cmd = 'UPDATE';
