-- ============================================
-- EMERGENCY FIX - RESTORE DATA ACCESS
-- ============================================
-- The new staff policies may be conflicting with existing user policies
-- This script ensures users can still see their own data

-- 1. FIX BOOKINGS - Ensure users can see their own bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
CREATE POLICY "Users can view own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
CREATE POLICY "Users can insert own bookings"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
CREATE POLICY "Users can update own bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 2. FIX DOGS - Ensure users can see their own dogs
DROP POLICY IF EXISTS "Users can view own dogs" ON dogs;
CREATE POLICY "Users can view own dogs"
ON dogs
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own dogs" ON dogs;
CREATE POLICY "Users can insert own dogs"
ON dogs
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own dogs" ON dogs;
CREATE POLICY "Users can update own dogs"
ON dogs
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

-- 3. FIX PROFILES - Ensure users can see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- 4. FIX SUBSCRIPTIONS - Ensure users can see their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 5. FIX INDIVIDUAL DAY BOOKINGS
DROP POLICY IF EXISTS "Users can view own individual bookings" ON individual_day_bookings;
CREATE POLICY "Users can view own individual bookings"
ON individual_day_bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own individual bookings" ON individual_day_bookings;
CREATE POLICY "Users can insert own individual bookings"
ON individual_day_bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 6. Verify all policies
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('bookings', 'dogs', 'profiles', 'subscriptions', 'individual_day_bookings')
ORDER BY tablename, policyname;
