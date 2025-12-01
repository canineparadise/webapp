-- ============================================
-- TEST THE EXACT QUERY THAT'S FAILING
-- ============================================
-- This will show us the actual PostgreSQL error

-- STEP 1: Test simple dogs query
SELECT '=== TEST 1: Simple dogs query ===' as test;
SELECT id, name, owner_id FROM dogs LIMIT 3;

-- STEP 2: Test dogs with profiles join
SELECT '=== TEST 2: Dogs with profiles join ===' as test;
SELECT
  d.id,
  d.name,
  d.owner_id,
  p.first_name,
  p.last_name,
  p.email,
  p.phone
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
ORDER BY d.name ASC
LIMIT 5;

-- STEP 3: Check if there are any policies with errors
SELECT '=== TEST 3: All dogs policies ===' as test;
SELECT
  policyname,
  cmd,
  qual::text,
  with_check::text
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;

-- STEP 4: Check profiles policies
SELECT '=== TEST 4: All profiles policies ===' as test;
SELECT
  policyname,
  cmd,
  qual::text,
  with_check::text
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- STEP 5: Check for trigger function errors by calling them
SELECT '=== TEST 5: Check trigger functions ===' as test;
SELECT
  proname,
  prosecdef,
  provolatile
FROM pg_proc
WHERE proname LIKE 'auto_approve%';

-- STEP 6: Temporarily disable RLS to test if that's the issue
SELECT '=== TEST 6: Testing with RLS disabled temporarily ===' as test;
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT
  d.id,
  d.name,
  p.first_name || ' ' || p.last_name as owner
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 3;

-- Re-enable RLS immediately
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT '=== RLS RE-ENABLED ===' as status;

-- STEP 7: Force PostgREST reload again
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

SELECT '=== POSTGREST RELOADED ===' as status;
