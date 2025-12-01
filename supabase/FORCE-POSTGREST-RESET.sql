-- ============================================
-- FORCE POSTGREST COMPLETE RESET
-- ============================================

-- Kill ALL database connections (forces PostgREST to reconnect)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = current_database();

-- Wait a moment
SELECT pg_sleep(2);

-- Send multiple reload signals
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

SELECT pg_sleep(1);

NOTIFY pgrst, 'reload schema';

-- Verify connection pool is fresh
SELECT 'CONNECTIONS KILLED' as status,
       (SELECT COUNT(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections;
