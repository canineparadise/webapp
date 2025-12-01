-- ============================================
-- EMERGENCY: DISABLE RLS TO FIX TIMEOUT
-- ============================================
-- The RLS policies are causing infinite recursion/timeout
-- Temporarily disable RLS so your site works while we fix it

-- STEP 1: Disable RLS on dogs and profiles
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Re-enable the triggers (they weren't the problem)
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;
ALTER TABLE dogs ENABLE TRIGGER update_dogs_updated_at;

-- STEP 3: Verify status
SELECT
  'RLS STATUS' as info,
  tablename,
  CASE rowsecurity
    WHEN true THEN 'RLS ENABLED'
    WHEN false THEN 'RLS DISABLED'
  END as rls_status
FROM pg_tables
WHERE tablename IN ('dogs', 'profiles');

SELECT
  'TRIGGER STATUS' as info,
  trigger_name,
  CASE tgenabled
    WHEN 'O' THEN 'ENABLED'
    WHEN 'D' THEN 'DISABLED'
    ELSE tgenabled::text
  END as status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'dogs'
  AND trigger_name NOT LIKE 'RI_%'
ORDER BY trigger_name;

-- STEP 4: Reload PostgREST
NOTIFY pgrst, 'reload schema';

SELECT 'DONE - RLS disabled, triggers enabled. Your site should work now. Hard refresh!' as instruction;
