-- ============================================
-- DIAGNOSE WHY TRIGGER ISN'T WORKING
-- ============================================

-- Step 1: Check if trigger exists and is enabled
SELECT
  'TRIGGER STATUS' as check_type,
  tgname as trigger_name,
  tgenabled as is_enabled,
  tgtype,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgname = 'auto_approve_existing_client_dogs_trigger';

-- Step 2: Check if Andrew's email is in existing_clients
SELECT
  'ANDREW IN EXISTING CLIENTS?' as check_type,
  COUNT(*) as count,
  array_agg(email) as emails
FROM existing_clients
WHERE LOWER(email) = LOWER('andrew_carrick@yahoo.co.uk');

-- Step 3: Check Andrew's latest dogs and their approval status
SELECT
  'ANDREWS LATEST DOGS' as check_type,
  d.name,
  d.is_approved,
  d.is_draft,
  d.created_at,
  p.email as owner_email
FROM dogs d
INNER JOIN profiles p ON d.owner_id = p.id
WHERE p.email = 'andrew_carrick@yahoo.co.uk'
ORDER BY d.created_at DESC
LIMIT 5;

-- Step 4: Test the trigger function directly
DO $$
DECLARE
  test_result BOOLEAN;
  test_email TEXT;
BEGIN
  -- Simulate what the trigger does
  SELECT email INTO test_email
  FROM profiles
  WHERE email = 'andrew_carrick@yahoo.co.uk'
  LIMIT 1;

  RAISE NOTICE 'Test email: %', test_email;

  SELECT EXISTS (
    SELECT 1 FROM existing_clients
    WHERE LOWER(email) = LOWER(test_email)
  ) INTO test_result;

  RAISE NOTICE 'Should be existing client: %', test_result;
END $$;

-- Step 5: Check if there are any other triggers on dogs table that might interfere
SELECT
  'ALL TRIGGERS ON DOGS TABLE' as check_type,
  tgname as trigger_name,
  tgenabled as is_enabled,
  CASE tgtype::integer & 66
    WHEN 2 THEN 'BEFORE'
    WHEN 64 THEN 'INSTEAD OF'
    ELSE 'AFTER'
  END as timing,
  CASE tgtype::integer & 28
    WHEN 4 THEN 'INSERT'
    WHEN 8 THEN 'DELETE'
    WHEN 16 THEN 'UPDATE'
    WHEN 12 THEN 'INSERT OR DELETE'
    WHEN 20 THEN 'INSERT OR UPDATE'
    WHEN 24 THEN 'DELETE OR UPDATE'
    WHEN 28 THEN 'INSERT OR DELETE OR UPDATE'
  END as events
FROM pg_trigger
WHERE tgrelid = 'dogs'::regclass
AND tgname NOT LIKE 'RI_%'; -- Exclude foreign key triggers

-- Step 6: Manually approve the latest pending dog for Andrew
UPDATE dogs
SET
  is_approved = TRUE,
  is_draft = FALSE
WHERE owner_id IN (
  SELECT id FROM profiles WHERE email = 'andrew_carrick@yahoo.co.uk'
)
AND is_approved = FALSE
AND created_at >= NOW() - INTERVAL '2 hours';

-- Step 7: Verify the update worked
SELECT
  'AFTER MANUAL FIX' as check_type,
  d.name,
  d.is_approved,
  d.is_draft,
  d.created_at
FROM dogs d
INNER JOIN profiles p ON d.owner_id = p.id
WHERE p.email = 'andrew_carrick@yahoo.co.uk'
ORDER BY d.created_at DESC
LIMIT 5;
