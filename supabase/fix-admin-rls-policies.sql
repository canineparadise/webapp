-- ============================================
-- FIX ADMIN/STAFF RLS POLICIES
-- ============================================
-- This fixes the 500 errors on admin dashboard by allowing
-- admin and staff users to view all records

-- 1. DOGS TABLE - Allow staff to view all dogs
-- ============================================
DROP POLICY IF EXISTS "Staff can view all dogs" ON dogs;
CREATE POLICY "Staff can view all dogs"
ON dogs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
  OR owner_id = auth.uid()  -- Users can still see their own dogs
);

-- 2. SUBSCRIPTIONS TABLE - Allow staff to view all subscriptions
-- ============================================
DROP POLICY IF EXISTS "Staff can view all subscriptions" ON subscriptions;
CREATE POLICY "Staff can view all subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
  OR user_id = auth.uid()  -- Users can still see their own subscriptions
);

-- 3. BOOKINGS TABLE - Allow staff to view all bookings
-- ============================================
DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;
CREATE POLICY "Staff can view all bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
  OR user_id = auth.uid()  -- Users can still see their own bookings
);

-- 4. PROFILES TABLE - Allow staff to view all profiles
-- ============================================
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
CREATE POLICY "Staff can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'staff')
  )
  OR id = auth.uid()  -- Users can still see their own profile
);

-- 5. DISCOUNT_CODE_USAGE - Fix if table exists
-- ============================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'discount_code_usage') THEN
    -- Drop existing policy
    DROP POLICY IF EXISTS "Staff can view discount usage" ON discount_code_usage;

    -- Create new policy
    EXECUTE 'CREATE POLICY "Staff can view discount usage"
    ON discount_code_usage
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN (''admin'', ''staff'')
      )
      OR user_id = auth.uid()
    )';
  END IF;
END $$;

-- 6. REFUND_REQUESTS - Create table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dog_id UUID REFERENCES dogs(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on refund_requests
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Create indexes for refund_requests
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

-- Policies for refund_requests
DROP POLICY IF EXISTS "Users can view own refund requests" ON refund_requests;
CREATE POLICY "Users can view own refund requests"
ON refund_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can view all refund requests" ON refund_requests;
CREATE POLICY "Staff can view all refund requests"
ON refund_requests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

DROP POLICY IF EXISTS "Users can create refund requests" ON refund_requests;
CREATE POLICY "Users can create refund requests"
ON refund_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff can update refund requests" ON refund_requests;
CREATE POLICY "Staff can update refund requests"
ON refund_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'staff')
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('dogs', 'subscriptions', 'bookings', 'profiles', 'refund_requests')
ORDER BY tablename, policyname;
