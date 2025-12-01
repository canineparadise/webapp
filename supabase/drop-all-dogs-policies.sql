-- Drop ALL policies on dogs table
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'dogs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON dogs', pol.policyname);
  END LOOP;
END $$;

-- Verify
SELECT 'dogs_policies_after' as check, COUNT(*)::text as count FROM pg_policies WHERE tablename = 'dogs';

-- Reload
NOTIFY pgrst, 'reload schema';

SELECT 'DONE - All dogs policies dropped. Hard refresh now!' as status;
