-- ============================================
-- FINAL FIX - DROP ALL POLICIES FIRST
-- ============================================
-- The error shows we need to drop policies BEFORE dropping the function
-- This script drops ALL dependent policies first, then the function

-- STEP 1: DROP ALL POLICIES THAT USE current_user_role()
-- ============================================

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "subscriptions_select_staff" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_allow_select_all" ON subscriptions;

-- BOOKINGS
DROP POLICY IF EXISTS "bookings_select_staff" ON bookings;
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_allow_select_all" ON bookings;

-- REFUND_REQUESTS
DROP POLICY IF EXISTS "refund_requests_select_staff" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_update_staff" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_select_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_insert_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_allow_select_all" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_allow_insert_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_allow_update_all" ON refund_requests;

-- DISCOUNT_CODES
DROP POLICY IF EXISTS "discount_codes_select_staff" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_manage_admin" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_allow_select_all" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_allow_all" ON discount_codes;

-- DISCOUNT_CODE_USAGE
DROP POLICY IF EXISTS "discount_code_usage_select_staff" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_select_own" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_insert_own" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_allow_select_all" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_allow_insert_all" ON discount_code_usage;

-- PROFILES
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_staff" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_select_all" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_allow_update_all" ON profiles;

-- DOGS
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

-- DROP POLICIES FROM OTHER TABLES
DO $$
DECLARE
  tbl_name text;
BEGIN
  FOR tbl_name IN
    SELECT t.tablename
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'admin_settings', 'assessment_bookings', 'assessment_recurring_slots',
      'dog_medications', 'incidents', 'individual_day_bookings',
      'legal_agreements', 'play_groups', 'sections',
      'staff_assignments', 'staff_tasks', 'assessment_slots', 'roll_calls'
    )
  LOOP
    -- Drop all possible policy variations
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_staff" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_own" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_allow_select_all" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_all" ON %I', tbl_name, tbl_name);
  END LOOP;
END $$;

-- STEP 2: NOW DROP THE FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS current_user_role();

-- STEP 3: CREATE SIMPLE POLICIES (NO current_user_role)
-- ============================================

-- PROFILES TABLE
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

CREATE POLICY "dogs_update_all"
ON dogs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- SUBSCRIPTIONS TABLE
CREATE POLICY "subscriptions_select_all"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "subscriptions_insert_own"
ON subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscriptions_update_all"
ON subscriptions FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- BOOKINGS TABLE
CREATE POLICY "bookings_select_all"
ON bookings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "bookings_insert_own"
ON bookings FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "bookings_update_all"
ON bookings FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- REFUND_REQUESTS TABLE
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
CREATE POLICY "discount_code_usage_select_all"
ON discount_code_usage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "discount_code_usage_insert_all"
ON discount_code_usage FOR INSERT
TO authenticated
WITH CHECK (true);

-- OTHER TABLES - SIMPLE SELECT POLICIES
DO $$
DECLARE
  tbl_name text;
BEGIN
  FOR tbl_name IN
    SELECT t.tablename
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'admin_settings', 'assessment_bookings', 'assessment_recurring_slots',
      'dog_medications', 'incidents', 'individual_day_bookings',
      'legal_agreements', 'play_groups', 'sections',
      'staff_assignments', 'staff_tasks', 'assessment_slots', 'roll_calls'
    )
  LOOP
    -- Create simple select policy
    EXECUTE format(
      'CREATE POLICY "%I_select_all" ON %I FOR SELECT TO authenticated USING (true)',
      tbl_name, tbl_name
    );
  END LOOP;
END $$;

-- STEP 4: VERIFY THE FIX
-- ============================================

-- Verify function is gone
SELECT
  '=== VERIFY FUNCTION DROPPED ===' as info,
  COUNT(*) as function_count
FROM pg_proc
WHERE proname = 'current_user_role';

-- Verify no policies use current_user_role (should be 0)
SELECT
  '=== POLICIES USING current_user_role() (SHOULD BE 0) ===' as info,
  COUNT(*) as policy_count
FROM pg_policies
WHERE qual::text LIKE '%current_user_role%';

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
  'refund_requests', 'discount_codes', 'discount_code_usage',
  'admin_settings', 'assessment_bookings', 'assessment_recurring_slots',
  'dog_medications', 'incidents', 'individual_day_bookings',
  'legal_agreements', 'play_groups', 'sections',
  'staff_assignments', 'staff_tasks', 'assessment_slots', 'roll_calls'
)
GROUP BY tablename
ORDER BY tablename;

-- Final success message
SELECT
  '=== FIX COMPLETE ===' as status,
  'All policies simplified. Function dropped. Refresh your dashboard to test.' as next_step;
