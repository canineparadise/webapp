-- ============================================
-- FORCE DISABLE EVERYTHING
-- ============================================

-- STEP 1: Check current RLS status
SELECT 'BEFORE' as when, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

-- STEP 2: Force disable RLS
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 3: Force disable triggers
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs DISABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;
ALTER TABLE dogs DISABLE TRIGGER update_dogs_updated_at;

-- STEP 4: Verify AFTER
SELECT 'AFTER' as when, tablename, rowsecurity FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

-- STEP 5: Kill any stuck connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE pid <> pg_backend_pid()
  AND datname = current_database()
  AND state != 'idle';

-- STEP 6: Reload
NOTIFY pgrst, 'reload schema';

-- STEP 7: Test a simple query
SELECT 'TEST' as info, id, name FROM dogs LIMIT 1;
