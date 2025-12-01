-- ============================================
-- SHOW EXACT POLICY DEFINITIONS
-- ============================================

-- Show dogs policies one by one
SELECT
  'DOGS POLICIES' as info,
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'dogs'
ORDER BY policyname;

-- Show profiles policies one by one
SELECT
  'PROFILES POLICIES' as info,
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if any policies reference current_user_role (shouldn't exist anymore)
SELECT
  'POLICIES WITH current_user_role' as info,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE qual::text LIKE '%current_user_role%'
   OR with_check::text LIKE '%current_user_role%';

-- Check trigger function security
SELECT
  'TRIGGER FUNCTIONS' as info,
  proname,
  CASE prosecdef
    WHEN true THEN 'SECURITY DEFINER'
    ELSE 'NOT SECURITY DEFINER'
  END as security_mode
FROM pg_proc
WHERE proname LIKE 'auto_approve%';
