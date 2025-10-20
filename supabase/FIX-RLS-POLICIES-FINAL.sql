-- ================================================================
-- FINAL RLS POLICY REVIEW AND FIXES
-- ================================================================
-- This script ensures proper Row Level Security across all tables
-- Run this in Supabase SQL Editor
-- ================================================================

-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "Staff can view today's bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can update bookings" ON bookings;

DROP POLICY IF EXISTS "Staff can view dogs" ON dogs;
DROP POLICY IF EXISTS "Admin can view all dogs" ON dogs;
DROP POLICY IF EXISTS "Users can view own dogs" ON dogs;
DROP POLICY IF EXISTS "Staff can update dogs" ON dogs;
DROP POLICY IF EXISTS "Admin can update dogs" ON dogs;

DROP POLICY IF EXISTS "Staff can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;

DROP POLICY IF EXISTS "Staff can view subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can view all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admin can update subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

-- ================================================================
-- BOOKINGS TABLE RLS
-- ================================================================

-- Admin: Full access to all bookings
CREATE POLICY "Admin: Full access to bookings"
ON bookings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Staff: Can view only TODAY's bookings (not historical data)
CREATE POLICY "Staff: View today's bookings only"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
  AND booking_date = CURRENT_DATE
);

-- Staff: Can update today's bookings (check-in/out)
CREATE POLICY "Staff: Update today's bookings"
ON bookings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
  AND booking_date = CURRENT_DATE
);

-- Users: Can view their own bookings
CREATE POLICY "Users: View own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- ================================================================
-- DOGS TABLE RLS
-- ================================================================

-- Admin: Full access to all dogs
CREATE POLICY "Admin: Full access to dogs"
ON dogs
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Staff: Can view all dogs (need to see for check-in)
CREATE POLICY "Staff: View all dogs"
ON dogs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Staff: Can update dogs (for assessment approval)
CREATE POLICY "Staff: Update dogs"
ON dogs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Users: Can view their own dogs
CREATE POLICY "Users: View own dogs"
ON dogs
FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
);

-- Users: Can insert their own dogs
CREATE POLICY "Users: Insert own dogs"
ON dogs
FOR INSERT
TO authenticated
WITH CHECK (
  owner_id = auth.uid()
);

-- Users: Can update their own dogs (before approval)
CREATE POLICY "Users: Update own dogs"
ON dogs
FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
);

-- ================================================================
-- PROFILES TABLE RLS
-- ================================================================

-- Admin: Full access to all profiles
CREATE POLICY "Admin: Full access to profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Staff: Can view all profiles (need to see client info)
CREATE POLICY "Staff: View all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'staff'
  )
);

-- Users: Can view their own profile
CREATE POLICY "Users: View own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- Users: Can update their own profile
CREATE POLICY "Users: Update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  id = auth.uid()
)
WITH CHECK (
  id = auth.uid()
  AND role = 'user' -- Prevent users from changing their own role
);

-- ================================================================
-- SUBSCRIPTIONS TABLE RLS
-- ================================================================

-- Admin: Full access to all subscriptions
CREATE POLICY "Admin: Full access to subscriptions"
ON subscriptions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Staff: Can view all subscriptions
CREATE POLICY "Staff: View all subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Users: Can view their own subscriptions
CREATE POLICY "Users: View own subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Users: Can update their own subscriptions (for cancellation)
CREATE POLICY "Users: Update own subscriptions"
ON subscriptions
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- ================================================================
-- LEGAL_AGREEMENTS TABLE RLS
-- ================================================================

DROP POLICY IF EXISTS "Admin can view all legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Users can view own legal agreements" ON legal_agreements;
DROP POLICY IF EXISTS "Users can insert own legal agreements" ON legal_agreements;

-- Admin: Full access
CREATE POLICY "Admin: Full access to legal agreements"
ON legal_agreements
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Staff: Can view all legal agreements
CREATE POLICY "Staff: View all legal agreements"
ON legal_agreements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Users: Can view their own agreements
CREATE POLICY "Users: View own legal agreements"
ON legal_agreements
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Users: Can insert their own agreements
CREATE POLICY "Users: Insert own legal agreements"
ON legal_agreements
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- ================================================================
-- INCIDENTS TABLE RLS (if exists)
-- ================================================================

DROP POLICY IF EXISTS "Admin can manage incidents" ON incidents;
DROP POLICY IF EXISTS "Staff can manage incidents" ON incidents;
DROP POLICY IF EXISTS "Users can view incidents about their dogs" ON incidents;

-- Admin & Staff: Full access to incidents
CREATE POLICY "Admin & Staff: Full access to incidents"
ON incidents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Users: Can view incidents involving their dogs
CREATE POLICY "Users: View own dog incidents"
ON incidents
FOR SELECT
TO authenticated
USING (
  dog_id IN (
    SELECT id FROM dogs WHERE owner_id = auth.uid()
  )
);

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Run this to check all policies are in place:
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- NOTES:
-- ================================================================
-- After running this script:
-- 1. Test as admin user - should see everything
-- 2. Test as staff user - should only see today's bookings
-- 3. Test as regular user - should only see own data
-- 4. Verify staff can't access admin endpoints via API
-- ================================================================
