-- ============================================
-- CHECK POSTGREST RELATIONSHIP DETECTION
-- ============================================
-- PostgREST needs to detect the relationship correctly

-- STEP 1: Verify foreign key exists and is named correctly
SELECT
  '=== FOREIGN KEY CHECK ===' as info,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'dogs'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'owner_id';

-- STEP 2: Check the foreign key constraint details
SELECT
  '=== DETAILED FK INFO ===' as info,
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as references_table,
  contype as constraint_type,
  confupdtype as on_update,
  confdeltype as on_delete
FROM pg_constraint
WHERE conname = 'dogs_owner_id_fkey';

-- STEP 3: Test if RLS is blocking the join
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "test"}';

SELECT
  '=== TEST AS AUTHENTICATED USER ===' as test,
  d.id,
  d.name,
  p.first_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 1;

RESET ROLE;

-- STEP 4: Check if there are any pending migrations or schema changes
SELECT
  '=== PENDING SCHEMA CHANGES ===' as info,
  COUNT(*) as pending_count
FROM pg_stat_activity
WHERE state = 'active'
  AND query LIKE '%ALTER TABLE%';

-- STEP 5: Force multiple PostgREST reloads
DO $$
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM pg_notify('pgrst', 'reload schema');
    PERFORM pg_sleep(0.5);
  END LOOP;
END $$;

SELECT '=== 5 RELOAD NOTIFICATIONS SENT ===' as status;
