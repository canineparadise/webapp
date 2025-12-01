-- ============================================
-- CHECK FOREIGN KEY NAME FOR DOGS->PROFILES
-- ============================================
-- The error URL shows: profiles!dogs_owner_id_fkey
-- We need to verify this foreign key exists with the correct name

-- STEP 1: CHECK ALL FOREIGN KEYS ON DOGS TABLE
-- ============================================
SELECT
  '=== DOGS FOREIGN KEYS ===' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'dogs'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;

-- STEP 2: CHECK IF THE SPECIFIC FK EXISTS
-- ============================================
SELECT
  '=== CHECK dogs_owner_id_fkey EXISTS ===' as info,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_name = 'dogs'
      AND constraint_name = 'dogs_owner_id_fkey'
    ) THEN 'YES - Foreign key exists'
    ELSE 'NO - Foreign key missing!'
  END as fkey_status;

-- STEP 3: IF MISSING, CREATE IT
-- ============================================
DO $$
BEGIN
  -- Drop any existing foreign key on owner_id first
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'dogs'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'owner_id'
      AND tc.constraint_name != 'dogs_owner_id_fkey'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE dogs DROP CONSTRAINT ' || constraint_name || ' CASCADE'
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'dogs'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'owner_id'
        AND tc.constraint_name != 'dogs_owner_id_fkey'
      LIMIT 1
    );
    RAISE NOTICE 'Dropped existing foreign key with wrong name';
  END IF;

  -- Create the correctly named foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'dogs'
    AND constraint_name = 'dogs_owner_id_fkey'
  ) THEN
    ALTER TABLE dogs
      ADD CONSTRAINT dogs_owner_id_fkey
      FOREIGN KEY (owner_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;
    RAISE NOTICE 'Created dogs_owner_id_fkey foreign key';
  ELSE
    RAISE NOTICE 'Foreign key dogs_owner_id_fkey already exists';
  END IF;
END $$;

-- STEP 4: VERIFY THE FIX
-- ============================================
SELECT
  '=== VERIFY FOREIGN KEY CREATED ===' as info,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'dogs'
  AND tc.constraint_name = 'dogs_owner_id_fkey';

-- STEP 5: RELOAD POSTGREST SCHEMA
-- ============================================
NOTIFY pgrst, 'reload schema';

SELECT
  '=== FIX COMPLETE ===' as status,
  'Foreign key verified/created. PostgREST notified. Wait 5 sec then refresh.' as next_step;
