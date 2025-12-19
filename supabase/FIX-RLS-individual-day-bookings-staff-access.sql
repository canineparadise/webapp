-- Fix RLS policies on individual_day_bookings table
-- Staff need to be able to SELECT and UPDATE individual day bookings for check-in/check-out

-- ============================================
-- FIX SELECT POLICIES
-- ============================================
-- Drop existing SELECT policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own individual day bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Authenticated users can view individual day bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can view all individual day bookings" ON individual_day_bookings;

-- Allow ALL authenticated users to SELECT individual day bookings
-- This is needed for staff dashboard to see all bookings for today
CREATE POLICY "Authenticated users can view individual day bookings"
ON individual_day_bookings FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- FIX UPDATE POLICIES
-- ============================================
-- Drop existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own individual day bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can update individual day bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Authenticated users can update individual day bookings" ON individual_day_bookings;

-- Allow ALL authenticated users to UPDATE individual day bookings
-- This is needed for staff to check-in/check-out dogs
CREATE POLICY "Authenticated users can update individual day bookings"
ON individual_day_bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- ALSO FIX BOOKINGS TABLE SELECT (if needed)
-- ============================================
-- Drop existing SELECT policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;

-- Allow ALL authenticated users to SELECT bookings
CREATE POLICY "Authenticated users can view bookings"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- FIX UPDATE POLICIES ON BOOKINGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;

-- Allow ALL authenticated users to UPDATE bookings
CREATE POLICY "Authenticated users can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFY POLICIES WERE CREATED
-- ============================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('bookings', 'individual_day_bookings')
ORDER BY tablename, cmd;
