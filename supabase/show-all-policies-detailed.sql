-- ============================================
-- SHOW ALL POLICIES IN DETAIL
-- ============================================
-- Let's see exactly what policies exist

-- Dogs table policies
SELECT
  '=== DOGS TABLE POLICIES ===' as section,
  tablename,
  policyname,
  cmd,
  permissive,
  roles::text[],
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY cmd, policyname;

-- Profiles table policies
SELECT
  '=== PROFILES TABLE POLICIES ===' as section,
  tablename,
  policyname,
  cmd,
  permissive,
  roles::text[],
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Check for duplicate command types (this causes conflicts!)
SELECT
  '=== DUPLICATE POLICY CHECK ===' as section,
  tablename,
  cmd,
  COUNT(*) as policy_count,
  string_agg(policyname, ', ') as policy_names
FROM pg_policies
WHERE tablename IN ('dogs', 'profiles')
GROUP BY tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- Count policies per table
SELECT
  '=== POLICY COUNT PER TABLE ===' as section,
  tablename,
  COUNT(*) as total_policies
FROM pg_policies
WHERE tablename IN ('dogs', 'profiles')
GROUP BY tablename;
