-- ============================================
-- NUCLEAR RLS FIX - DROPS ALL AND RECREATES
-- ============================================
-- Run this if data is still not showing

-- BOOKINGS
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update all bookings" ON bookings;
DROP POLICY IF EXISTS "Bookings select policy" ON bookings;
DROP POLICY IF EXISTS "Bookings insert policy" ON bookings;
DROP POLICY IF EXISTS "Bookings update policy" ON bookings;

CREATE POLICY "Bookings select policy" ON bookings FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "Bookings insert policy" ON bookings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Bookings update policy" ON bookings FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

-- DOGS
DROP POLICY IF EXISTS "Users can view own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Users can update own dogs" ON dogs;
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
DROP POLICY IF EXISTS "Dogs select policy" ON dogs;
DROP POLICY IF EXISTS "Dogs insert policy" ON dogs;
DROP POLICY IF EXISTS "Dogs update policy" ON dogs;
DROP POLICY IF EXISTS "Dogs delete policy" ON dogs;

CREATE POLICY "Dogs select policy" ON dogs FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "Dogs insert policy" ON dogs FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Dogs update policy" ON dogs FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "Dogs delete policy" ON dogs FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

-- PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON profiles;

CREATE POLICY "Profiles select policy" ON profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')));

CREATE POLICY "Profiles update policy" ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid());

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions select policy" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions insert policy" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions update policy" ON subscriptions;

CREATE POLICY "Subscriptions select policy" ON subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "Subscriptions insert policy" ON subscriptions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Subscriptions update policy" ON subscriptions FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- INDIVIDUAL_DAY_BOOKINGS
DROP POLICY IF EXISTS "Users can view own individual bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can insert own individual bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Individual bookings select policy" ON individual_day_bookings;
DROP POLICY IF EXISTS "Individual bookings insert policy" ON individual_day_bookings;
DROP POLICY IF EXISTS "Individual bookings update policy" ON individual_day_bookings;

CREATE POLICY "Individual bookings select policy" ON individual_day_bookings FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')));

CREATE POLICY "Individual bookings insert policy" ON individual_day_bookings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Individual bookings update policy" ON individual_day_bookings FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- VERIFY
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename IN ('bookings', 'dogs', 'profiles', 'subscriptions', 'individual_day_bookings')
ORDER BY tablename, policyname;
