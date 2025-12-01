-- ============================================
-- CHECK AND FIX FOREIGN KEY RELATIONSHIP
-- ============================================
-- PostgREST uses the FK name to resolve relationships
-- Let's verify and potentially recreate it

-- STEP 1: Check current foreign key on dogs.owner_id
SELECT
  'FOREIGN KEYS ON DOGS' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name as references_table,
  ccu.column_name as references_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'dogs'
  AND tc.constraint_type = 'FOREIGN KEY';

-- STEP 2: Check what PostgREST sees as relationships
SELECT
  'POSTGREST RELATIONSHIPS' as info,
  c.relname as table_name,
  a.attname as column_name,
  con.conname as constraint_name
FROM pg_constraint con
JOIN pg_class c ON con.conrelid = c.oid
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(con.conkey)
WHERE c.relname = 'dogs'
  AND con.contype = 'f';

-- STEP 3: Drop and recreate the foreign key with correct name
ALTER TABLE dogs DROP CONSTRAINT IF EXISTS dogs_owner_id_fkey;
ALTER TABLE dogs DROP CONSTRAINT IF EXISTS fk_dogs_owner;
ALTER TABLE dogs DROP CONSTRAINT IF EXISTS dogs_owner_fkey;

-- Recreate with the exact name PostgREST expects
ALTER TABLE dogs
  ADD CONSTRAINT dogs_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- STEP 4: Verify new FK
SELECT
  'NEW FK CREATED' as info,
  tc.constraint_name
FROM information_schema.table_constraints tc
WHERE tc.table_name = 'dogs'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name = 'dogs_owner_id_fkey';

-- STEP 5: Reload PostgREST schema (important after FK changes)
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(2);
NOTIFY pgrst, 'reload schema';

SELECT 'DONE - FK recreated. Wait 15 seconds then hard refresh!' as instruction;
