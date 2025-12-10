-- ============================================
-- COMPREHENSIVE RLS FIX - RUN THIS IMMEDIATELY
-- ============================================
-- This script fixes all RLS policies to ensure:
-- 1. Users can see their own data
-- 2. Staff/Admin can see all data
-- 3. Proper INSERT/UPDATE permissions

-- ============================================
-- 1. BOOKINGS TABLE
-- ============================================
-- Drop all existing booking policies to start fresh
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update all bookings" ON bookings;

-- SELECT: Staff sees all, users see their own
CREATE POLICY "Bookings select policy"
ON bookings
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- INSERT: Users can only insert their own
CREATE POLICY "Bookings insert policy"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Staff can update all, users can update their own
CREATE POLICY "Bookings update policy"
ON bookings
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- ============================================
-- 2. DOGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can update own dogs" ON dogs;
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;

-- SELECT: Staff sees all, users see their own
CREATE POLICY "Dogs select policy"
ON dogs
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- INSERT: Users can only insert their own
CREATE POLICY "Dogs insert policy"
ON dogs
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- UPDATE: Users can update their own, staff can update all
CREATE POLICY "Dogs update policy"
ON dogs
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- DELETE: Users can delete their own dogs
DROP POLICY IF EXISTS "Dogs delete policy" ON dogs;
CREATE POLICY "Dogs delete policy"
ON dogs
FOR DELETE
TO authenticated
USING (
  owner_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- ============================================
-- 3. PROFILES TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;

-- SELECT: Staff sees all, users see their own
CREATE POLICY "Profiles select policy"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'staff')
  )
);

-- UPDATE: Users can update their own profile
CREATE POLICY "Profiles update policy"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ============================================
-- 4. SUBSCRIPTIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;

-- SELECT: Staff sees all, users see their own
CREATE POLICY "Subscriptions select policy"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- INSERT: Users can insert their own
CREATE POLICY "Subscriptions insert policy"
ON subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update their own
CREATE POLICY "Subscriptions update policy"
ON subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- 5. INDIVIDUAL_DAY_BOOKINGS TABLE
-- ============================================
DROP POLICY IF EXISTS "Users can view own individual bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can insert own individual bookings" ON individual_day_bookings;

-- SELECT: Staff sees all, users see their own
CREATE POLICY "Individual bookings select policy"
ON individual_day_bookings
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- INSERT: Users can insert their own
CREATE POLICY "Individual bookings insert policy"
ON individual_day_bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE: Users can update their own
CREATE POLICY "Individual bookings update policy"
ON individual_day_bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- ============================================
-- VERIFY ALL POLICIES
-- ============================================
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('bookings', 'dogs', 'profiles', 'subscriptions', 'individual_day_bookings')
ORDER BY tablename, policyname;
