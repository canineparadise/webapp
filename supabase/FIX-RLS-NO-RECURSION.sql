-- FIX: Remove recursive RLS policies and create simple ones

-- PROFILES table - allow users to see their own profile + staff/admin can see all
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Simple policy: users can always view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Staff/admin can view all profiles (using auth.jwt() to avoid recursion)
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
USING (
  (auth.jwt()->>'role')::text IN ('staff', 'admin')
  OR
  auth.uid() = id
);

-- BOOKINGS - fix to use auth.jwt() instead of subquery
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
CREATE POLICY "Staff can view all bookings"
ON bookings FOR SELECT
USING (
  (auth.jwt()->>'role')::text IN ('staff', 'admin')
  OR
  auth.uid() = user_id
);

-- DOGS - fix to use auth.jwt()
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
CREATE POLICY "Staff can view all dogs"
ON dogs FOR SELECT
USING (
  (auth.jwt()->>'role')::text IN ('staff', 'admin')
  OR
  auth.uid() = owner_id
);

-- SUBSCRIPTIONS - fix to use auth.jwt()
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;
CREATE POLICY "Staff can view all subscriptions"
ON subscriptions FOR SELECT
USING (
  (auth.jwt()->>'role')::text IN ('staff', 'admin')
  OR
  auth.uid() = user_id
);

-- LEGAL_AGREEMENTS - fix to use auth.jwt()
DROP POLICY IF EXISTS "Staff can view all legal agreements" ON legal_agreements;
CREATE POLICY "Staff can view all legal agreements"
ON legal_agreements FOR SELECT
USING (
  (auth.jwt()->>'role')::text IN ('staff', 'admin')
  OR
  auth.uid() = user_id
);

-- DOG_MEDICATIONS - fix to use auth.jwt()
DROP POLICY IF EXISTS "Staff can view all dog medications" ON dog_medications;
CREATE POLICY "Staff can view all dog medications"
ON dog_medications FOR SELECT
USING (
  (auth.jwt()->>'role')::text IN ('staff', 'admin')
  OR
  EXISTS (SELECT 1 FROM dogs WHERE dogs.id = dog_medications.dog_id AND dogs.owner_id = auth.uid())
);

-- Verify
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE policyname LIKE '%Staff%' OR policyname LIKE '%Users can view%'
ORDER BY tablename, policyname;
