-- ============================================
-- KILL ALL STUCK CONNECTIONS
-- ============================================
-- The connection pool is exhausted from stuck queries
-- We need to terminate them

-- STEP 1: Show stuck queries
SELECT
  'STUCK QUERIES' as info,
  pid,
  state,
  query_start,
  LEFT(query, 80) as query_preview
FROM pg_stat_activity
WHERE state = 'active'
  AND query NOT LIKE '%pg_stat_activity%'
  AND query_start < NOW() - INTERVAL '5 seconds'
ORDER BY query_start;

-- STEP 2: Kill ALL active connections except current
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND state = 'active'
  AND query_start < NOW() - INTERVAL '3 seconds';

-- STEP 3: Verify RLS is disabled
SELECT
  'RLS STATUS' as info,
  tablename,
  CASE rowsecurity WHEN true THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables
WHERE tablename IN ('dogs', 'profiles');

-- STEP 4: Verify triggers status
SELECT
  'TRIGGER STATUS' as info,
  trigger_name,
  CASE tgenabled WHEN 'O' THEN 'ENABLED' WHEN 'D' THEN 'DISABLED' ELSE tgenabled::text END as status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'dogs'
  AND trigger_name NOT LIKE 'RI_%';

-- STEP 5: Force PostgREST to get fresh connections
NOTIFY pgrst, 'reload schema';

SELECT 'DONE - Stuck connections killed. Wait 10 seconds then hard refresh!' as instruction;
