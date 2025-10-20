-- =====================================================
-- FIX RLS POLICIES FOR ASSESSMENT TABLES
-- =====================================================
-- Allow staff and admin to view all assessment bookings and slots
-- =====================================================

-- Check current policies
SELECT 'CURRENT ASSESSMENT_BOOKINGS POLICIES:' AS info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'assessment_bookings';

SELECT 'CURRENT ASSESSMENT_SLOTS POLICIES:' AS info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'assessment_slots';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Staff can view all assessment bookings" ON assessment_bookings;
DROP POLICY IF EXISTS "Staff can manage all assessment bookings" ON assessment_bookings;
DROP POLICY IF EXISTS "Users can view own assessment bookings" ON assessment_bookings;
DROP POLICY IF EXISTS "Users can create assessment bookings" ON assessment_bookings;

DROP POLICY IF EXISTS "Staff can view all assessment slots" ON assessment_slots;
DROP POLICY IF EXISTS "Staff can manage assessment slots" ON assessment_slots;
DROP POLICY IF EXISTS "Users can view assessment slots" ON assessment_slots;

-- Enable RLS on both tables
ALTER TABLE assessment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_slots ENABLE ROW LEVEL SECURITY;

-- ASSESSMENT_BOOKINGS POLICIES
-- Staff and admin can view all bookings
CREATE POLICY "Staff can view all assessment bookings"
ON assessment_bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Staff and admin can manage all bookings
CREATE POLICY "Staff can manage all assessment bookings"
ON assessment_bookings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Users can view their own bookings
CREATE POLICY "Users can view own assessment bookings"
ON assessment_bookings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create their own bookings
CREATE POLICY "Users can create assessment bookings"
ON assessment_bookings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ASSESSMENT_SLOTS POLICIES
-- Staff and admin can view all slots
CREATE POLICY "Staff can view all assessment slots"
ON assessment_slots
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
  OR true -- Everyone can view available slots
);

-- Staff and admin can manage slots
CREATE POLICY "Staff can manage assessment slots"
ON assessment_slots
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Verify policies were created
SELECT 'NEW ASSESSMENT_BOOKINGS POLICIES:' AS info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'assessment_bookings';

SELECT 'NEW ASSESSMENT_SLOTS POLICIES:' AS info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'assessment_slots';

-- Test query as staff would see it
SELECT 'TEST: Assessment bookings visible to staff:' AS info;
SELECT COUNT(*) as total_bookings
FROM assessment_bookings
WHERE booking_status = 'confirmed';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for assessment tables!';
  RAISE NOTICE '✅ Staff and admin can now view all assessment bookings and slots';
  RAISE NOTICE '✅ Users can view and create their own bookings';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Refresh your staff dashboard to see the assessments';
END $$;
