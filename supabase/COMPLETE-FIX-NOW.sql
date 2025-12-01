-- ============================================
-- COMPLETE FIX - RUN THIS NOW
-- ============================================
-- This will fix the dogs table AND restore proper functionality

-- STEP 1: KILL ALL STUCK CONNECTIONS
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = current_database()
  AND state != 'idle';

-- STEP 2: ENSURE RLS IS DISABLED ON DOGS AND PROFILES
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 3: DROP ALL EXISTING POLICIES
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('dogs', 'profiles')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- STEP 4: RE-ENABLE RLS
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: CREATE SIMPLE, NON-RECURSIVE POLICIES

-- PROFILES: Simple policies that don't cause recursion
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- DOGS: Simple policies that don't cause recursion
CREATE POLICY "dogs_select" ON dogs FOR SELECT TO authenticated USING (true);
CREATE POLICY "dogs_insert" ON dogs FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "dogs_update" ON dogs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dogs_delete" ON dogs FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- STEP 6: RE-ENABLE AUTO-APPROVE TRIGGERS
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;
ALTER TABLE dogs ENABLE TRIGGER update_dogs_updated_at;

-- STEP 7: VERIFY STATUS
SELECT
  'dogs_rls' as item,
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'dogs') as status
UNION ALL SELECT
  'profiles_rls',
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'profiles')
UNION ALL SELECT
  'dogs_policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'dogs')
UNION ALL SELECT
  'profiles_policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'profiles')
UNION ALL SELECT
  'dogs_triggers_enabled',
  (SELECT COUNT(*)::text FROM pg_trigger pt JOIN pg_class c ON pt.tgrelid = c.oid WHERE c.relname = 'dogs' AND pt.tgenabled = 'O' AND pt.tgname NOT LIKE 'RI_%');

-- STEP 8: RELOAD POSTGREST
NOTIFY pgrst, 'reload schema';

SELECT 'COMPLETE - Hard refresh your browser now!' as instruction;
