-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================
-- The error "infinite recursion detected in policy for relation 'profiles'"
-- happens when a profiles policy queries the profiles table itself.
--
-- SOLUTION: Use auth.jwt() to read the role directly from the JWT token
-- instead of querying the profiles table.

-- IMPORTANT: First, ensure the role is in the JWT token
-- This is done by Supabase automatically when you have a "role" column in profiles

-- 1. DROP ALL EXISTING POLICIES ON PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can do everything" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Staff read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;
DROP POLICY IF EXISTS "allow_read_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "allow_update_own_profile" ON profiles;

-- 2. CREATE NON-RECURSIVE POLICIES USING JWT
-- ============================================

-- Policy 1: Users can read their own profile
CREATE POLICY "allow_read_own_profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Staff/Admin can read all profiles (using JWT - NO RECURSION)
CREATE POLICY "allow_staff_read_all_profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  -- Check role directly from JWT token (no table query = no recursion)
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  -- Fallback: allow reading the role column by checking raw auth data
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Policy 3: Users can insert their own profile (during signup)
CREATE POLICY "allow_insert_own_profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 4: Users can update their own profile
CREATE POLICY "allow_update_own_profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 5: Admin can update any profile
CREATE POLICY "allow_admin_update_all_profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
  OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  OR
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
  OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  OR
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

-- 3. FIX OTHER TABLES TO USE JWT (AVOID RECURSION)
-- ============================================

-- Dogs table
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
CREATE POLICY "allow_staff_view_dogs"
ON dogs FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Subscriptions table
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;
CREATE POLICY "allow_staff_view_subscriptions"
ON subscriptions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- Bookings table
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
CREATE POLICY "allow_staff_view_bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('admin', 'staff')
  OR
  (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'staff')
);

-- 4. CREATE SIMPLE POLICIES FOR ALL OTHER TABLES
-- ============================================

-- Helper function to check if user is staff/admin
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('admin', 'staff')
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role')::text IN ('admin', 'staff')
    OR
    (SELECT raw_app_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now use this function for all other tables (avoiding recursion)

-- Apply to all tables that query profiles
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT t.tablename
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'refund_requests', 'legal_agreements', 'admin_settings',
      'assessment_recurring_slots', 'sections', 'dog_medications',
      'staff_assignments', 'staff_tasks', 'play_groups',
      'assessment_bookings', 'individual_day_bookings', 'incidents'
    )
  LOOP
    -- Drop existing staff view policy
    EXECUTE format('DROP POLICY IF EXISTS "Staff can view all %I" ON %I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "allow_staff_view_%I" ON %I', table_name, table_name);

    -- Create new policy using the helper function
    EXECUTE format(
      'CREATE POLICY "allow_staff_view_%I" ON %I FOR SELECT TO authenticated USING (is_staff_or_admin())',
      table_name, table_name
    );
  END LOOP;
END $$;

-- 5. VERIFY POLICIES WERE CREATED
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as command_type
FROM pg_policies
WHERE tablename IN (
  'profiles', 'dogs', 'subscriptions', 'bookings'
)
ORDER BY tablename, policyname;
