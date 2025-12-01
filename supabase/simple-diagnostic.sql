-- Simple diagnostic - all in one query
SELECT
  'dogs_count' as check_name,
  (SELECT COUNT(*)::text FROM dogs) as result
UNION ALL
SELECT
  'profiles_count',
  (SELECT COUNT(*)::text FROM profiles)
UNION ALL
SELECT
  'dogs_rls_enabled',
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'dogs')
UNION ALL
SELECT
  'profiles_rls_enabled',
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'profiles')
UNION ALL
SELECT
  'dogs_policy_count',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'dogs')
UNION ALL
SELECT
  'profiles_policy_count',
  (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'profiles')
UNION ALL
SELECT
  'trigger_security_definer',
  (SELECT CASE WHEN prosecdef THEN 'YES' ELSE 'NO' END FROM pg_proc WHERE proname = 'auto_approve_existing_client_dogs' LIMIT 1)
UNION ALL
SELECT
  'join_test',
  (SELECT COALESCE(d.name || ' owned by ' || p.first_name, 'FAILED') FROM dogs d LEFT JOIN profiles p ON d.owner_id = p.id LIMIT 1);
