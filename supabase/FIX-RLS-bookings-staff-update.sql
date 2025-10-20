-- Fix RLS policies to allow staff to UPDATE bookings for check-in/check-out

-- Drop existing UPDATE policies on bookings that might be blocking staff
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;

-- Allow authenticated users to UPDATE bookings (staff and admins need this for check-in/check-out)
CREATE POLICY "Authenticated users can update bookings"
ON bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'bookings' AND cmd = 'UPDATE';
