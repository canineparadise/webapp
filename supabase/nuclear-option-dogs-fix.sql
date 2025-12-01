-- ============================================
-- NUCLEAR OPTION - COMPLETELY RESET DOGS RLS
-- ============================================
-- If policies show correctly but 500 errors persist,
-- we need to completely reset the dogs table RLS

-- STEP 1: DISABLE RLS TEMPORARILY
-- ============================================
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;

-- STEP 2: DROP EVERY SINGLE POLICY
-- ============================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'dogs'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON dogs', pol_name);
  END LOOP;
END $$;

-- STEP 3: VERIFY ALL POLICIES ARE GONE
-- ============================================
SELECT
  '=== DOGS POLICIES (SHOULD BE EMPTY) ===' as info,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename = 'dogs';

-- STEP 4: RE-ENABLE RLS
-- ============================================
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

-- STEP 5: CREATE ONLY THE ESSENTIAL POLICIES
-- ============================================
-- Only 3 policies: one for SELECT, one for INSERT, one for all other operations

CREATE POLICY "dogs_allow_read"
ON dogs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "dogs_allow_insert_own"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_allow_modify"
ON dogs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "dogs_allow_delete_own"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- STEP 6: VERIFY NEW POLICIES
-- ============================================
SELECT
  '=== NEW DOGS POLICIES ===' as info,
  policyname,
  cmd,
  CASE
    WHEN qual::text = 'true' THEN 'SIMPLE (true)'
    WHEN qual::text LIKE '%owner_id%' THEN 'OWNER CHECK'
    ELSE qual::text
  END as policy_qual
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;

-- STEP 7: TEST QUERY
-- ============================================
SELECT
  '=== TEST: SELECT DOGS ===' as info,
  COUNT(*) as dog_count
FROM dogs;

-- STEP 8: SUCCESS MESSAGE
-- ============================================
SELECT
  '=== DOGS TABLE RESET COMPLETE ===' as status,
  'RLS completely reset. Try your dashboard now.' as next_step;
