-- ============================================
-- FIX STAFF CHECK-IN/CHECK-OUT RLS POLICIES
-- ============================================
-- This allows staff users to view and manage bookings for check-in/check-out

-- 1. Allow staff to view all bookings (SELECT)
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
CREATE POLICY "Staff can view all bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
  OR user_id = auth.uid()
);

-- 2. Allow staff to update bookings (for check-in/check-out)
DROP POLICY IF EXISTS "Staff can update all bookings" ON bookings;
CREATE POLICY "Staff can update all bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
  OR user_id = auth.uid()
);

-- 3. Allow staff to view all dogs
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
CREATE POLICY "Staff can view all dogs"
ON dogs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
  OR owner_id = auth.uid()
);

-- 4. Allow staff to view all profiles (for owner info)
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'staff')
  )
  OR id = auth.uid()
);

-- Verify the policies exist
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('bookings', 'dogs', 'profiles')
AND policyname LIKE '%Staff%'
ORDER BY tablename, policyname;
