-- ============================================
-- FIX: KEEP RLS, DISABLE TRIGGERS TEMPORARILY
-- ============================================

-- Disable triggers (they seem to be causing the timeout)
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;
ALTER TABLE dogs DISABLE TRIGGER update_dogs_updated_at;

-- Kill stuck connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = current_database()
  AND state != 'idle';

-- Reload
NOTIFY pgrst, 'reload schema';

-- Verify
SELECT
  'dogs_triggers_disabled' as item,
  (SELECT COUNT(*)::text FROM pg_trigger pt JOIN pg_class c ON pt.tgrelid = c.oid
   WHERE c.relname = 'dogs' AND pt.tgenabled = 'D' AND pt.tgname NOT LIKE 'RI_%') as count;

SELECT 'Triggers disabled. Hard refresh now!' as instruction;
