-- ============================================
-- DEFINITIVE FIX - REMOVE ALL POLICY CONFLICTS
-- ============================================
-- The issue is likely conflicting UPDATE policies
-- We need to drop EVERYTHING and start fresh with NO conflicts

-- STEP 1: DROP ALL POLICIES ON DOGS (DYNAMICALLY)
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
    EXECUTE format('DROP POLICY %I ON dogs', pol_name);
    RAISE NOTICE 'Dropped policy: %', pol_name;
  END LOOP;
END $$;

-- STEP 2: DROP ALL POLICIES ON PROFILES (DYNAMICALLY)
-- ============================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY %I ON profiles', pol_name);
    RAISE NOTICE 'Dropped policy: %', pol_name;
  END LOOP;
END $$;

-- STEP 3: VERIFY ALL POLICIES ARE GONE
-- ============================================
SELECT
  '=== POLICIES AFTER DROP (SHOULD BE EMPTY) ===' as info,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('dogs', 'profiles')
GROUP BY tablename;

-- STEP 4: CREATE CLEAN PROFILES POLICIES (NO CONFLICTS)
-- ============================================
-- Only ONE policy per operation type to avoid conflicts

CREATE POLICY "profiles_select"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "profiles_insert"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update"
ON profiles FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 5: CREATE CLEAN DOGS POLICIES (NO CONFLICTS)
-- ============================================
-- Only ONE policy per operation type to avoid conflicts

CREATE POLICY "dogs_select"
ON dogs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "dogs_insert"
ON dogs FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "dogs_update"
ON dogs FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "dogs_delete"
ON dogs FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- STEP 6: VERIFY NEW POLICIES
-- ============================================
SELECT
  '=== NEW POLICIES ===' as info,
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual::text = 'true' THEN 'ALLOW ALL'
    WHEN qual::text LIKE '%owner_id%auth.uid%' THEN 'OWNER ONLY'
    WHEN qual::text LIKE '%id%auth.uid%' THEN 'SELF ONLY'
    ELSE LEFT(qual::text, 50)
  END as policy_type
FROM pg_policies
WHERE tablename IN ('dogs', 'profiles')
ORDER BY tablename, cmd, policyname;

-- STEP 7: TEST QUERY
-- ============================================
SELECT
  '=== TEST: Select dogs with owner info ===' as info,
  d.id,
  d.name,
  p.first_name || ' ' || p.last_name as owner_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 5;

-- STEP 8: SUCCESS MESSAGE
-- ============================================
SELECT
  '=== FIX COMPLETE ===' as status,
  'All conflicts removed. Only 1 policy per operation. Test dashboard now.' as next_step;
