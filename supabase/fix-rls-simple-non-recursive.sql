-- ============================================
-- SIMPLE NON-RECURSIVE RLS FIX
-- ============================================
-- The JWT approach doesn't work because role isn't in the JWT
-- We need a simpler approach that avoids recursion

-- SOLUTION: Create a security definer function that bypasses RLS
-- to check the role without causing recursion

-- 1. CREATE A HELPER FUNCTION (runs with elevated privileges, bypasses RLS)
-- ============================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- This function runs with SECURITY DEFINER which bypasses RLS
  -- So it can read from profiles without triggering the recursion
  RETURN (
    SELECT role
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. DROP ALL EXISTING POLICIES
-- ============================================

-- Profiles
DROP POLICY IF EXISTS "allow_read_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_staff_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_admin_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_public_insert" ON profiles;

-- Dogs
DROP POLICY IF EXISTS "allow_staff_view_dogs" ON dogs;
DROP POLICY IF EXISTS "Authenticated users can view dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: View all dogs" ON dogs;
DROP POLICY IF EXISTS "Users: View own dogs" ON dogs;

-- Subscriptions
DROP POLICY IF EXISTS "allow_staff_view_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Staff: View all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users: View own subscriptions" ON subscriptions;

-- Bookings
DROP POLICY IF EXISTS "allow_staff_view_bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Staff: View today's bookings only" ON bookings;
DROP POLICY IF EXISTS "Users: View own bookings" ON bookings;

-- 3. CREATE SIMPLE NON-RECURSIVE POLICIES USING THE HELPER FUNCTION
-- ============================================

-- PROFILES TABLE
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_select_staff"
ON profiles FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_admin"
ON profiles FOR UPDATE
TO authenticated
USING (current_user_role() = 'admin')
WITH CHECK (current_user_role() = 'admin');

-- DOGS TABLE
CREATE POLICY "dogs_select_own"
ON dogs FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "dogs_select_staff"
ON dogs FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

-- Keep existing admin/user policies for dogs
-- (they're not causing issues)

-- SUBSCRIPTIONS TABLE
CREATE POLICY "subscriptions_select_own"
ON subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "subscriptions_select_staff"
ON subscriptions FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

-- Keep existing admin policy
-- (it's not causing issues)

-- BOOKINGS TABLE
CREATE POLICY "bookings_select_own"
ON bookings FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "bookings_select_staff"
ON bookings FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

-- Keep existing admin policy
-- (it's not causing issues)

-- 4. APPLY TO ALL OTHER TABLES
-- ============================================

-- Refund requests
DROP POLICY IF EXISTS "allow_staff_view_refund_requests" ON refund_requests;
DROP POLICY IF EXISTS "Staff can view all refund requests" ON refund_requests;
DROP POLICY IF EXISTS "Users can view own refund requests" ON refund_requests;

CREATE POLICY "refund_requests_select_own"
ON refund_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "refund_requests_select_staff"
ON refund_requests FOR SELECT
TO authenticated
USING (current_user_role() IN ('admin', 'staff'));

-- Apply to other tables that exist
DO $$
DECLARE
  tbl_name text;
BEGIN
  FOR tbl_name IN
    SELECT t.tablename
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'legal_agreements', 'admin_settings', 'assessment_recurring_slots',
      'sections', 'dog_medications', 'staff_assignments', 'staff_tasks',
      'play_groups', 'assessment_bookings', 'individual_day_bookings', 'incidents'
    )
  LOOP
    -- Drop old policies
    EXECUTE format('DROP POLICY IF EXISTS "allow_staff_view_%I" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "Staff can view all %I" ON %I', tbl_name, tbl_name);

    -- Create new staff policy
    EXECUTE format(
      'CREATE POLICY "%I_select_staff" ON %I FOR SELECT TO authenticated USING (current_user_role() IN (''admin'', ''staff''))',
      tbl_name, tbl_name
    );

    -- Create user policy if table has user_id column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_name = tbl_name AND c.column_name = 'user_id'
    ) THEN
      EXECUTE format(
        'CREATE POLICY "%I_select_own" ON %I FOR SELECT TO authenticated USING (user_id = auth.uid())',
        tbl_name, tbl_name
      );
    END IF;
  END LOOP;
END $$;

-- 5. VERIFY
-- ============================================
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'dogs', 'subscriptions', 'bookings')
ORDER BY tablename, policyname;
