-- ============================================
-- DIAGNOSE SIGNUP ERROR
-- Testing why new user signups are failing
-- ============================================

-- Step 1: Check if handle_new_user trigger exists
SELECT
  'TRIGGER STATUS' as check_type,
  tgname as trigger_name,
  tgenabled as is_enabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Step 2: Check the current function definition
SELECT
  'FUNCTION DEFINITION' as check_type,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Step 3: Test if the function can access existing_clients table
DO $$
DECLARE
  test_email TEXT := 'test@example.com';
  is_existing BOOLEAN;
BEGIN
  -- Test if we can query existing_clients from a function
  SELECT EXISTS (
    SELECT 1 FROM public.existing_clients
    WHERE LOWER(email) = LOWER(test_email)
  ) INTO is_existing;

  RAISE NOTICE 'Can query existing_clients: %', is_existing;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error querying existing_clients: %', SQLERRM;
END $$;

-- Step 4: Check profiles table columns
SELECT
  'PROFILES TABLE COLUMNS' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 5: Check RLS policies on existing_clients table
SELECT
  'EXISTING_CLIENTS RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'existing_clients';

-- Step 6: Check RLS policies on profiles table
SELECT
  'PROFILES RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- Step 7: Test inserting a profile manually to see what fails
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
  test_email TEXT := 'testuser@example.com';
BEGIN
  RAISE NOTICE 'Testing profile insert for email: %', test_email;

  -- Try the insert that the trigger does
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone_number,
    emergency_contact_name,
    emergency_contact_phone,
    approval_status,
    assessment_completed,
    created_at
  ) VALUES (
    test_user_id,
    test_email,
    '',
    '',
    '',
    '',
    'pending_registration',
    FALSE,
    NOW()
  );

  RAISE NOTICE 'Profile insert successful';

  -- Clean up test data
  DELETE FROM public.profiles WHERE id = test_user_id;
  RAISE NOTICE 'Test profile deleted';

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error inserting profile: %', SQLERRM;
END $$;
