-- FIX: Allow staff and admin to see ALL data across all tables

-- DOGS table
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
CREATE POLICY "Staff can view all dogs"
ON dogs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- PROFILES table (so admin can see all users)
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('staff', 'admin')
  )
);

-- SUBSCRIPTIONS table
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;
CREATE POLICY "Staff can view all subscriptions"
ON subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- LEGAL_AGREEMENTS table
DROP POLICY IF EXISTS "Staff can view all legal agreements" ON legal_agreements;
CREATE POLICY "Staff can view all legal agreements"
ON legal_agreements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- DOG_MEDICATIONS table (if it exists)
DROP POLICY IF EXISTS "Staff can view all dog medications" ON dog_medications;
CREATE POLICY "Staff can view all dog medications"
ON dog_medications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Verify all policies were created
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE policyname LIKE 'Staff can view%'
ORDER BY tablename, policyname;
