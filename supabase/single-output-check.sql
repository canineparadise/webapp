-- All results in one output
SELECT * FROM (
  SELECT 1 as ord, 'dogs_rls' as item, (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'dogs') as value
  UNION ALL SELECT 2, 'profiles_rls', (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'profiles')
  UNION ALL SELECT 3, 'subscriptions_rls', (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'subscriptions')
  UNION ALL SELECT 4, 'bookings_rls', (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'bookings')
  UNION ALL SELECT 5, 'dogs_policies', (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'dogs')
  UNION ALL SELECT 6, 'profiles_policies', (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'profiles')
  UNION ALL SELECT 7, 'subscriptions_policies', (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'subscriptions')
  UNION ALL SELECT 8, 'bookings_policies', (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'bookings')
  UNION ALL SELECT 9, 'bad_policies_count', (SELECT COUNT(*)::text FROM pg_policies WHERE qual::text LIKE '%current_user_role%')
  UNION ALL SELECT 10, 'dogs_count', (SELECT COUNT(*)::text FROM dogs)
  UNION ALL SELECT 11, 'profiles_count', (SELECT COUNT(*)::text FROM profiles)
  UNION ALL SELECT 12, 'subscriptions_count', (SELECT COUNT(*)::text FROM subscriptions)
  UNION ALL SELECT 13, 'bookings_count', (SELECT COUNT(*)::text FROM bookings)
  UNION ALL SELECT 14, 'triggers_disabled', (SELECT COUNT(*)::text FROM pg_trigger pt JOIN pg_class c ON pt.tgrelid = c.oid WHERE c.relname = 'dogs' AND pt.tgenabled = 'D' AND pt.tgname NOT LIKE 'RI_%')
  UNION ALL SELECT 15, 'triggers_enabled', (SELECT COUNT(*)::text FROM pg_trigger pt JOIN pg_class c ON pt.tgrelid = c.oid WHERE c.relname = 'dogs' AND pt.tgenabled = 'O' AND pt.tgname NOT LIKE 'RI_%')
  UNION ALL SELECT 16, 'join_test', (SELECT COALESCE(d.name || ' - ' || p.first_name, 'FAILED') FROM dogs d LEFT JOIN profiles p ON d.owner_id = p.id LIMIT 1)
  UNION ALL SELECT 17, 'fk_exists', (SELECT CASE WHEN EXISTS(SELECT 1 FROM information_schema.table_constraints WHERE table_name='dogs' AND constraint_name='dogs_owner_id_fkey') THEN 'YES' ELSE 'NO' END)
) x ORDER BY ord;
