-- ============================================
-- FINAL COMPLETE FIX - NUCLEAR OPTION
-- ============================================
-- If everything else failed, this completely resets
-- dogs and profiles RLS from scratch

-- STEP 1: Show current state
SELECT '=== CURRENT DOGS POLICIES ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'dogs';

SELECT '=== CURRENT PROFILES POLICIES ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';

-- STEP 2: Completely disable RLS temporarily
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 3: Drop ALL policies dynamically
DO $$
DECLARE
  pol record;
BEGIN
  -- Drop all dogs policies
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'dogs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON dogs', pol.policyname);
  END LOOP;

  -- Drop all profiles policies
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- STEP 4: Re-enable RLS
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create ONLY essential policies - ONE per operation
-- NO conflicts, NO recursion possible

-- PROFILES: Allow all authenticated users
CREATE POLICY "profiles_read"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_create"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_modify"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DOGS: Allow all authenticated users
CREATE POLICY "dogs_read"
ON dogs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "dogs_create"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_modify"
ON dogs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "dogs_remove"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- STEP 6: Verify clean slate
SELECT '=== NEW DOGS POLICIES (should be 4) ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'dogs' ORDER BY cmd, policyname;

SELECT '=== NEW PROFILES POLICIES (should be 3) ===' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles' ORDER BY cmd, policyname;

-- STEP 7: Test the query
SELECT '=== TEST QUERY ===' as test;
SELECT
  d.id,
  d.name,
  p.first_name,
  p.last_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 3;

-- STEP 8: Multiple reload attempts
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

SELECT '=== COMPLETE ===' as status,
       'PostgREST reloaded 3 times. Wait 15 seconds then HARD REFRESH browser.' as instruction;
