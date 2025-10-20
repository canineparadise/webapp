-- FIX: Allow staff and admin users to see ALL bookings (simple version)

-- Create policy: Staff can view ALL bookings (will not fail if exists)
DO $$
BEGIN
  -- Drop if exists
  DROP POLICY IF EXISTS "Staff can view all bookings" ON bookings;

  -- Create new policy
  CREATE POLICY "Staff can view all bookings"
  ON bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

  RAISE NOTICE 'RLS policy created successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- Verify it worked
SELECT
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;
