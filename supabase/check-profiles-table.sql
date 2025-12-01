-- ============================================
-- CHECK PROFILES TABLE FOR ISSUES
-- ============================================

-- Check RLS on BOTH tables
SELECT 'RLS STATUS' as info, tablename, rowsecurity
FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

-- Check policy count
SELECT 'POLICY COUNT' as info, tablename, COUNT(*) as count
FROM pg_policies WHERE tablename IN ('dogs', 'profiles') GROUP BY tablename;

-- Check triggers on profiles
SELECT 'PROFILES TRIGGERS' as info, trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'profiles';

-- Disable RLS on profiles too (might have been missed)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop any remaining policies on profiles
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- Verify
SELECT 'AFTER FIX - RLS' as info, tablename, rowsecurity
FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

SELECT 'AFTER FIX - POLICIES' as info, tablename, COUNT(*) as count
FROM pg_policies WHERE tablename IN ('dogs', 'profiles') GROUP BY tablename;

-- Reload
NOTIFY pgrst, 'reload schema';

SELECT 'DONE' as status;
