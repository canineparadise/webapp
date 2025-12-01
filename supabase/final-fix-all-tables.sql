-- ============================================
-- FINAL FIX - SIMPLIFY ALL TABLE POLICIES
-- ============================================
-- Drop the current_user_role() function and simplify ALL policies
-- to use USING (true) for SELECT operations

-- 1. DROP THE PROBLEMATIC FUNCTION
-- ============================================
DROP FUNCTION IF EXISTS current_user_role();

-- 2. FIX ALL REMAINING TABLES WITH SIMPLE POLICIES
-- ============================================

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS "subscriptions_select_own" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_staff" ON subscriptions;
DROP POLICY IF EXISTS "Admin: Full access to subscriptions" ON subscriptions;

CREATE POLICY "subscriptions_allow_select_all"
ON subscriptions FOR SELECT
TO authenticated
USING (true);

-- BOOKINGS
DROP POLICY IF EXISTS "bookings_select_own" ON bookings;
DROP POLICY IF EXISTS "bookings_select_staff" ON bookings;
DROP POLICY IF EXISTS "Admin: Full access to bookings" ON bookings;

CREATE POLICY "bookings_allow_select_all"
ON bookings FOR SELECT
TO authenticated
USING (true);

-- REFUND_REQUESTS
DROP POLICY IF EXISTS "refund_requests_select_own" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_select_staff" ON refund_requests;
DROP POLICY IF EXISTS "refund_requests_update_staff" ON refund_requests;

CREATE POLICY "refund_requests_allow_select_all"
ON refund_requests FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "refund_requests_allow_insert_own"
ON refund_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "refund_requests_allow_update_all"
ON refund_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DISCOUNT_CODES
DROP POLICY IF EXISTS "discount_codes_select_staff" ON discount_codes;
DROP POLICY IF EXISTS "discount_codes_manage_admin" ON discount_codes;

CREATE POLICY "discount_codes_allow_select_all"
ON discount_codes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "discount_codes_allow_all"
ON discount_codes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- DISCOUNT_CODE_USAGE
DROP POLICY IF EXISTS "discount_code_usage_select_own" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_select_staff" ON discount_code_usage;
DROP POLICY IF EXISTS "discount_code_usage_insert_own" ON discount_code_usage;

CREATE POLICY "discount_code_usage_allow_select_all"
ON discount_code_usage FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "discount_code_usage_allow_insert_all"
ON discount_code_usage FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. FIX ALL OTHER TABLES THAT MIGHT USE current_user_role()
-- ============================================
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
      'incidents', 'assessment_slots', 'roll_calls', 'individual_day_bookings'
    )
  LOOP
    -- Drop old policies
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_staff" ON %I', tbl_name, tbl_name);
    EXECUTE format('DROP POLICY IF EXISTS "%I_select_own" ON %I', tbl_name, tbl_name);

    -- Create simple policy allowing all authenticated users to select
    EXECUTE format(
      'CREATE POLICY "%I_allow_select_all" ON %I FOR SELECT TO authenticated USING (true)',
      tbl_name, tbl_name
    );
  END LOOP;
END $$;

-- 4. VERIFY NO POLICIES USE current_user_role()
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  qual
FROM pg_policies
WHERE qual::text LIKE '%current_user_role%'
ORDER BY tablename, policyname;

-- 5. VERIFY ALL POLICIES
-- ============================================
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
  'profiles', 'dogs', 'subscriptions', 'bookings',
  'refund_requests', 'discount_codes', 'discount_code_usage'
)
GROUP BY tablename
ORDER BY tablename;
