-- ============================================
-- FIX DOGS TABLE TRIGGERS
-- ============================================
-- The triggers might be causing 500 errors if they query
-- tables with problematic RLS policies

-- STEP 1: CHECK WHAT THE TRIGGER FUNCTIONS DO
-- ============================================
SELECT
  '=== TRIGGER FUNCTION DEFINITIONS ===' as info,
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname IN (
  'auto_approve_existing_client_dogs',
  'auto_approve_existing_client_dogs_on_update',
  'update_updated_at_column'
);

-- STEP 2: TEMPORARILY DISABLE PROBLEMATIC TRIGGERS
-- ============================================
-- We'll disable the auto-approve triggers temporarily to test

ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;

-- Keep the updated_at trigger enabled (it's safe)
-- ALTER TABLE dogs DISABLE TRIGGER update_dogs_updated_at;

-- STEP 3: VERIFY TRIGGERS ARE DISABLED
-- ============================================
SELECT
  '=== TRIGGER STATUS ===' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    WHEN 'R' THEN 'REPLICA'
    WHEN 'A' THEN 'ALWAYS'
    ELSE 'UNKNOWN'
  END as trigger_status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'dogs'
ORDER BY trigger_name;

-- STEP 4: TEST IF DOGS TABLE NOW WORKS
-- ============================================
SELECT
  '=== TEST: SELECT DOGS (SHOULD WORK NOW) ===' as info,
  COUNT(*) as total_dogs
FROM dogs;

-- STEP 5: INSTRUCTIONS
-- ============================================
SELECT
  '=== NEXT STEPS ===' as info,
  'Triggers disabled. Test your dashboard. If it works, we need to fix the trigger functions.' as instruction;
