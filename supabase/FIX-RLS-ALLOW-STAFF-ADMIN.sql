-- FIX: Allow staff and admin users to see ALL bookings

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;

-- Create new policy: Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
USING (
  auth.uid() = user_id
);

-- Create new policy: Staff can view ALL bookings
CREATE POLICY "Staff can view all bookings"
ON bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Verify the policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'bookings';
