-- ============================================
-- RE-ENABLE EVERYTHING SAFELY
-- ============================================

-- STEP 1: Re-enable RLS on dogs and profiles
ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 2: Re-enable the auto-approve triggers
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;
ALTER TABLE dogs ENABLE TRIGGER update_dogs_updated_at;

-- STEP 3: Verify everything is enabled
SELECT
  'dogs_rls' as item,
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'dogs') as status
UNION ALL SELECT
  'profiles_rls',
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'profiles')
UNION ALL SELECT
  'dogs_policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'dogs')
UNION ALL SELECT
  'profiles_policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'profiles')
UNION ALL SELECT
  'triggers_enabled',
  (SELECT COUNT(*)::text FROM pg_trigger pt JOIN pg_class c ON pt.tgrelid = c.oid
   WHERE c.relname = 'dogs' AND pt.tgenabled = 'O' AND pt.tgname NOT LIKE 'RI_%')
ORDER BY item;
