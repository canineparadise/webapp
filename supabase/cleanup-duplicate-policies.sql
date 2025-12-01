-- ============================================
-- CLEANUP DUPLICATE RLS POLICIES
-- ============================================
-- Remove duplicate policies that might cause conflicts

-- DOGS TABLE - Remove duplicates, keep only necessary ones
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: View all dogs" ON dogs;
DROP POLICY IF EXISTS "Staff: Update dogs" ON dogs;
DROP POLICY IF EXISTS "Users: Insert own dogs" ON dogs;
DROP POLICY IF EXISTS "Users: Update own dogs" ON dogs;
DROP POLICY IF EXISTS "Users: View own dogs" ON dogs;

-- Keep only these essential policies for dogs:
-- "Staff can view all dogs" - already exists
-- "Admin: Full access to dogs" - already exists
-- "Users can delete own dogs" - already exists
-- "Users can insert own dogs" - already exists
-- "Users can update own dogs" - already exists

-- BOOKINGS TABLE - Remove duplicates
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update bookings" ON bookings;
DROP POLICY IF EXISTS "Staff: View today's bookings only" ON bookings;
DROP POLICY IF EXISTS "Staff: Update today's bookings" ON bookings;
DROP POLICY IF EXISTS "Users: View own bookings" ON bookings;

-- Keep only these essential policies for bookings:
-- "Staff can view all bookings" - already exists
-- "Admin: Full access to bookings" - already exists
-- "Users can delete own bookings" - already exists
-- "Users can insert own bookings" - already exists

-- SUBSCRIPTIONS TABLE - Remove duplicates
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can view subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Staff: View all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users: Update own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users: View own subscriptions" ON subscriptions;

-- Keep only these essential policies for subscriptions:
-- "Staff can view all subscriptions" - already exists
-- "Admin: Full access to subscriptions" - already exists
-- "Users can insert own subscriptions" - already exists

-- PROFILES TABLE - Remove duplicates, keep simple ones
-- ============================================
DROP POLICY IF EXISTS "allow_public_insert" ON profiles;

-- Keep only these essential policies for profiles:
-- "Staff can view all profiles" - already exists
-- "allow_insert_own_profile" - already exists
-- "allow_read_profiles" - already exists
-- "allow_update_own_profile" - already exists

-- REFUND_REQUESTS - Remove duplicate
-- ============================================
DROP POLICY IF EXISTS "Users can create own refund requests" ON refund_requests;

-- Keep only these essential policies for refund_requests:
-- "Users can create refund requests" - already exists
-- "Users can view own refund requests" - already exists
-- "Staff can view all refund requests" - already exists
-- "Staff can update refund requests" - already exists

-- Verify final policies
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('dogs', 'subscriptions', 'bookings', 'profiles', 'refund_requests')
ORDER BY tablename, policyname;
