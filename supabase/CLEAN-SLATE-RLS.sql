-- ============================================
-- CLEAN SLATE - DELETE ALL POLICIES FIRST
-- ============================================

-- BOOKINGS - Remove ALL policies
DROP POLICY IF EXISTS "Admin: Full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Bookings insert policy" ON bookings;
DROP POLICY IF EXISTS "Bookings select policy" ON bookings;
DROP POLICY IF EXISTS "Bookings update policy" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_own" ON bookings;
DROP POLICY IF EXISTS "bookings_select_all" ON bookings;
DROP POLICY IF EXISTS "bookings_update_all" ON bookings;

-- DOGS - Remove ALL policies
DROP POLICY IF EXISTS "Dogs delete policy" ON dogs;
DROP POLICY IF EXISTS "Dogs insert policy" ON dogs;
DROP POLICY IF EXISTS "Dogs select policy" ON dogs;
DROP POLICY IF EXISTS "Dogs update policy" ON dogs;
DROP POLICY IF EXISTS "dogs_delete" ON dogs;
DROP POLICY IF EXISTS "dogs_insert" ON dogs;
DROP POLICY IF EXISTS "dogs_select" ON dogs;
DROP POLICY IF EXISTS "dogs_update" ON dogs;

-- PROFILES - Remove ALL policies
DROP POLICY IF EXISTS "Profiles select policy" ON profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- SUBSCRIPTIONS - Remove ALL policies
DROP POLICY IF EXISTS "Admin: Full access to subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions insert policy" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions select policy" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions update policy" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_insert_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_all" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_all" ON subscriptions;

-- INDIVIDUAL_DAY_BOOKINGS - Remove ALL policies
DROP POLICY IF EXISTS "Admin can manage all bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Individual bookings insert policy" ON individual_day_bookings;
DROP POLICY IF EXISTS "Individual bookings select policy" ON individual_day_bookings;
DROP POLICY IF EXISTS "Individual bookings update policy" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON individual_day_bookings;
DROP POLICY IF EXISTS "individual_day_bookings_select_all" ON individual_day_bookings;

-- ============================================
-- NOW CREATE CLEAN POLICIES
-- ============================================

-- BOOKINGS
CREATE POLICY "bookings_access" ON bookings FOR ALL TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
WITH CHECK (user_id = auth.uid());

-- DOGS
CREATE POLICY "dogs_access" ON dogs FOR ALL TO authenticated
USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
WITH CHECK (owner_id = auth.uid());

-- PROFILES
CREATE POLICY "profiles_access" ON profiles FOR ALL TO authenticated
USING (id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'staff')))
WITH CHECK (id = auth.uid());

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions_access" ON subscriptions FOR ALL TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
WITH CHECK (user_id = auth.uid());

-- INDIVIDUAL_DAY_BOOKINGS
CREATE POLICY "individual_bookings_access" ON individual_day_bookings FOR ALL TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'staff')))
WITH CHECK (user_id = auth.uid());

-- VERIFY - Should show only 5 policies now
SELECT tablename, policyname, cmd FROM pg_policies
WHERE tablename IN ('bookings', 'dogs', 'profiles', 'subscriptions', 'individual_day_bookings')
ORDER BY tablename;
