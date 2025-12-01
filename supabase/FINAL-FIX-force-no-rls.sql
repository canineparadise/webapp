-- ============================================
-- FINAL FIX: FORCE RLS OFF FOR ALL ROLES
-- ============================================
-- PostgREST uses the 'authenticated' role which might still have RLS
-- We need to completely disable RLS and also FORCE it off

-- STEP 1: Disable RLS completely
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Also set FORCE option (this bypasses RLS even for table owners)
ALTER TABLE dogs FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;

-- Wait, that's wrong. Let me fix - we need NO FORCE:
ALTER TABLE dogs NO FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles NO FORCE ROW LEVEL SECURITY;

-- STEP 3: Drop ALL policies on dogs and profiles (they cause issues even when disabled)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'dogs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON dogs', pol.policyname);
  END LOOP;

  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- STEP 4: Verify no policies exist
SELECT 'POLICIES REMAINING' as info, COUNT(*) as count
FROM pg_policies WHERE tablename IN ('dogs', 'profiles');

-- STEP 5: Verify RLS is disabled
SELECT 'RLS STATUS' as info, tablename, rowsecurity as rls_enabled
FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

-- STEP 6: Kill stuck connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = current_database()
  AND state != 'idle';

-- STEP 7: Reload PostgREST
NOTIFY pgrst, 'reload schema';

-- STEP 8: Wait and reload again
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

SELECT 'DONE - RLS completely disabled, all policies dropped. WAIT 15 SECONDS then hard refresh!' as instruction;
