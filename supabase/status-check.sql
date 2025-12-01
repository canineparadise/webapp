-- Single query to show all status
SELECT
  'dogs_rls' as check_name,
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'dogs') as result
UNION ALL
SELECT
  'profiles_rls',
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'profiles')
UNION ALL
SELECT
  'dogs_policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'dogs')
UNION ALL
SELECT
  'profiles_policies',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'profiles')
UNION ALL
SELECT
  'dogs_triggers_disabled',
  (SELECT COUNT(*)::text FROM pg_trigger pt
   JOIN pg_class c ON pt.tgrelid = c.oid
   WHERE c.relname = 'dogs' AND pt.tgenabled = 'D')
ORDER BY check_name;
