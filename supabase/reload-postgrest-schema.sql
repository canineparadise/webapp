-- ============================================
-- RELOAD POSTGREST SCHEMA CACHE
-- ============================================
-- PostgREST caches the schema and policies
-- We need to force it to reload after all our policy changes

-- STEP 1: NOTIFY POSTGREST TO RELOAD SCHEMA
-- ============================================
NOTIFY pgrst, 'reload schema';

-- STEP 2: VERIFY CURRENT POLICIES ARE SIMPLE
-- ============================================
SELECT
  '=== CURRENT DOGS POLICIES ===' as info,
  policyname,
  cmd,
  qual::text as policy_condition
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY cmd, policyname;

SELECT
  '=== CURRENT PROFILES POLICIES ===' as info,
  policyname,
  cmd,
  qual::text as policy_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- STEP 3: CHECK FOR ANY REMAINING FUNCTIONS
-- ============================================
SELECT
  '=== CHECK FOR current_user_role FUNCTION ===' as info,
  COUNT(*) as function_exists
FROM pg_proc
WHERE proname = 'current_user_role';

-- STEP 4: TEST THE EXACT QUERY THE DASHBOARD USES
-- ============================================
-- This mimics what PostgREST does
SELECT
  '=== TEST: Exact dashboard query ===' as info,
  d.*,
  row_to_json(p.*) as owner
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
ORDER BY d.name ASC
LIMIT 5;

-- STEP 5: CHECK IF RLS IS ACTUALLY ENABLED
-- ============================================
SELECT
  '=== RLS STATUS ===' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('dogs', 'profiles')
ORDER BY tablename;

-- STEP 6: SUCCESS MESSAGE
-- ============================================
SELECT
  '=== POSTGREST NOTIFIED ===' as status,
  'Schema cache reload requested. Wait 5 seconds then refresh dashboard.' as next_step;
