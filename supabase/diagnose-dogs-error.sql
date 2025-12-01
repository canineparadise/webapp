-- ============================================
-- DIAGNOSE DOGS TABLE 500 ERROR
-- ============================================
-- Even after fixing policies, dogs table still returns 500
-- Let's check for any remaining issues

-- 1. CHECK ALL CURRENT POLICIES ON DOGS TABLE
-- ============================================
SELECT
  '=== ALL DOGS POLICIES ===' as info,
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;

-- 2. CHECK FOR CONFLICTING POLICIES
-- ============================================
-- Multiple UPDATE policies might conflict
SELECT
  '=== DOGS UPDATE POLICIES (MIGHT CONFLICT) ===' as info,
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'dogs'
AND cmd = 'UPDATE'
ORDER BY policyname;

-- 3. CHECK DOGS TABLE STRUCTURE
-- ============================================
SELECT
  '=== DOGS TABLE COLUMNS ===' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dogs'
ORDER BY ordinal_position;

-- 4. CHECK FOR FOREIGN KEY ISSUES
-- ============================================
SELECT
  '=== DOGS FOREIGN KEYS ===' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'dogs'
AND tc.constraint_type = 'FOREIGN KEY';

-- 5. CHECK IF RLS IS ENABLED
-- ============================================
SELECT
  '=== RLS STATUS ===' as info,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'dogs';

-- 6. TEST SIMPLE QUERY
-- ============================================
-- Try to count dogs (this should work if policies are correct)
SELECT
  '=== TEST: COUNT DOGS ===' as info,
  COUNT(*) as total_dogs
FROM dogs;

-- 7. CHECK FOR TRIGGERS ON DOGS TABLE
-- ============================================
SELECT
  '=== DOGS TRIGGERS ===' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'dogs'
ORDER BY trigger_name;
