-- ============================================
-- CLEANUP DUPLICATE POLICIES AFTER RECURSION FIX
-- ============================================
-- After running fix-infinite-recursion-rls.sql, we have duplicate policies
-- This script removes all the OLD policies and keeps only the NEW non-recursive ones

-- 1. PROFILES TABLE - Remove old duplicates
-- ============================================
DROP POLICY IF EXISTS "allow_public_insert" ON profiles;

-- Keep only:
-- - "allow_read_own_profile"
-- - "allow_staff_read_all_profiles"
-- - "allow_insert_own_profile"
-- - "allow_update_own_profile"
-- - "allow_admin_update_all_profiles"

-- 2. DOGS TABLE - Remove old duplicates
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: View all dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: Update dogs" ON dogs;
DROP POLICY IF EXISTS "Users: Insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Users: Update own dogs" ON dogs;
DROP POLICY IF EXISTS "Users: View own dogs" ON dogs;

-- Keep only:
-- - "allow_staff_view_dogs"
-- - "Admin: Full access to dogs"
-- - "Users can delete own dogs"
-- - "Users can insert own dogs"
-- - "Users can update own dogs"

-- 3. SUBSCRIPTIONS TABLE - Remove old duplicates
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Staff: View all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users: Update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users: View own subscriptions" ON subscriptions;

-- Keep only:
-- - "allow_staff_view_subscriptions"
-- - "Admin: Full access to subscriptions"
-- - "Users can insert own subscriptions"

-- 4. BOOKINGS TABLE - Remove old duplicates
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Staff: View today's bookings only" ON bookings;
DROP POLICY IF EXISTS "Staff: Update today's bookings" ON bookings;
DROP POLICY IF EXISTS "Users: View own bookings" ON bookings;

-- Keep only:
-- - "allow_staff_view_bookings"
-- - "Admin: Full access to bookings"
-- - "Users can delete own bookings"
-- - "Users can insert own bookings"

-- 5. VERIFY FINAL POLICIES
-- ============================================
SELECT
  tablename,
  policyname,
  cmd as command_type
FROM pg_policies
WHERE tablename IN ('profiles', 'dogs', 'subscriptions', 'bookings')
ORDER BY tablename, policyname;
