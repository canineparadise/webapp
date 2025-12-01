-- ============================================
-- GET ACTUAL ERROR FROM DOGS TABLE
-- ============================================
-- We need to see the actual PostgreSQL error, not just 500

-- STEP 1: TEST SIMPLE SELECT (NO JOIN)
-- ============================================
SELECT
  '=== TEST 1: Simple SELECT (no join) ===' as test,
  id,
  name,
  owner_id,
  is_approved
FROM dogs
LIMIT 5;

-- STEP 2: TEST SELECT WITH PROFILES JOIN
-- ============================================
-- This is what the dashboard is trying to do
SELECT
  '=== TEST 2: SELECT with profiles join ===' as test,
  d.id,
  d.name,
  d.owner_id,
  p.first_name,
  p.last_name,
  p.email
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 5;

-- STEP 3: CHECK PROFILES POLICIES
-- ============================================
SELECT
  '=== PROFILES POLICIES ===' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- STEP 4: CHECK DOGS POLICIES
-- ============================================
SELECT
  '=== DOGS POLICIES ===' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;

-- STEP 5: CHECK IF THERE ARE DUPLICATE UPDATE POLICIES
-- ============================================
SELECT
  '=== DUPLICATE POLICIES CHECK ===' as info,
  tablename,
  cmd,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('dogs', 'profiles')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;
