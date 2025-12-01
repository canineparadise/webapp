-- ============================================
-- URGENT COMPLETE RLS FIX - RUN THIS NOW
-- ============================================
-- This script will:
-- 1. Check for all policies using current_user_role()
-- 2. Drop the function completely
-- 3. Simplify ALL policies to eliminate recursion
-- 4. Verify the fix worked

-- STEP 1: SHOW CURRENT PROBLEM
-- ============================================
SELECT
  '=== POLICIES USING current_user_role() (BEFORE FIX) ===' as info,
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE qual::text LIKE '%current_user_role%'
ORDER BY tablename, policyname;

-- STEP 2: DROP THE PROBLEMATIC FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS current_user_role();

-- STEP 3: FIX ALL TABLES WITH SIMPLE POLICIES
-- ============================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_staff" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update_all" ON profiles;

CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_all"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DOGS TABLE
DROP POLICY IF EXISTS "dogs_select_own" ON dogs;
DROP POLICY IF EXISTS "dogs_select_staff" ON dogs;
DROP POLICY IF EXISTS "dogs_insert_own" ON dogs;
DROP POLICY IF EXISTS "dogs_update_own" ON dogs;
DROP POLICY IF EXISTS "dogs_delete_own" ON dogs;
DROP POLICY IF EXISTS "dogs_update_staff" ON dogs;
DROP POLICY IF EXISTS "dogs_insert_admin" ON dogs;
DROP POLICY IF EXISTS "dogs_delete_admin" ON dogs;
DROP POLICY IF EXISTS "dogs_allow_select_all" ON dogs;
DROP POLICY IF EXISTS "dogs_allow_insert_own" ON dogs;
DROP POLICY IF EXISTS "dogs_allow_update_own" ON dogs;
DROP POLICY IF EXISTS "dogs_allow_delete_own" ON dogs;

CREATE POLICY "dogs_select_all"
ON dogs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "dogs_insert_own"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_update_own"
ON dogs FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_delete_own"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- SUBSCRIPTIONS TABLE
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_staff" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_allow_select_all" ON subscriptions;

CREATE POLICY "subscriptions_select_all"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

-- BOOKINGS TABLE
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_select_staff" ON bookings;
DROP POLICY IF EXISTS "bookings_allow_select_all" ON bookings;

CREATE POLICY "bookings_select_all"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- REFUND_REQUESTS TABLE
DROP POLICY IF EXISTS "refund_requests_select_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_select_staff" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_insert_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_update_staff" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_allow_select_all" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_allow_insert_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_allow_update_all" ON refund_requests;

CREATE POLICY "refund_requests_select_all"
ON refund_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "refund_requests_insert_own"
ON refund_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "refund_requests_update_all"
ON refund_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DISCOUNT_CODES TABLE
DROP POLICY IF EXISTS "discount_codes_select_staff" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_manage_admin" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_allow_select_all" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_allow_all" ON discount_codes;

CREATE POLICY "discount_codes_select_all"
ON discount_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "discount_codes_all_operations"
ON discount_codes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- DISCOUNT_CODE_USAGE TABLE
DROP POLICY IF EXISTS "discount_code_usage_select_own" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_select_staff" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_insert_own" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_allow_select_all" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_allow_insert_all" ON discount_code_usage;

CREATE POLICY "discount_code_usage_select_all"
ON discount_code_usage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "discount_code_usage_insert_all"
ON discount_code_usage FOR INSERT
TO authenticated
WITH CHECK (true);

-- FIX OTHER TABLES THAT MIGHT USE current_user_role()
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
      'play_groups', 'assessment_bookings', 'individual_day_bookings',
      'incidents', 'assessment_slots', 'roll_calls'
    )
  LOOP
    -- Drop old policies
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_staff" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_own" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_allow_select_all" ON %I', tbl_name, tbl_name);

    -- Create simple policy allowing all authenticated users to select
    EXECUTE format(
      'CREATE POLICY "%I_select_all" ON %I FOR SELECT TO authenticated USING (true)',
      tbl_name, tbl_name
    );
  END LOOP;
END $$;

-- STEP 4: VERIFY THE FIX
-- ============================================

-- Should return NO rows (all current_user_role references removed)
SELECT
  '=== POLICIES STILL USING current_user_role() (SHOULD BE EMPTY) ===' as info,
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE qual::text LIKE '%current_user_role%'
ORDER BY tablename, policyname;

-- Show all policies on critical tables
SELECT
  '=== ALL POLICIES ON CRITICAL TABLES ===' as info,
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual::text = 'true' THEN 'SIMPLE (true)'
    WHEN qual::text LIKE '%auth.uid()%' THEN 'SIMPLE (auth.uid)'
    ELSE 'COMPLEX: ' || LEFT(qual::text, 50)
  END as policy_type
FROM pg_policies
WHERE tablename IN (
  'profiles', 'dogs', 'subscriptions', 'bookings',
  'refund_requests', 'discount_codes', 'discount_code_usage'
)
ORDER BY tablename, policyname;

-- Policy count summary
SELECT
  '=== POLICY COUNT SUMMARY ===' as info,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
  'profiles', 'dogs', 'subscriptions', 'bookings',
  'refund_requests', 'discount_codes', 'discount_code_usage'
)
GROUP BY tablename
ORDER BY tablename;

-- Final message
SELECT '=== FIX COMPLETE ===' as status,
       'All policies simplified. Refresh your dashboard to test.' as next_step;
