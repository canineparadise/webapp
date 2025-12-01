-- ============================================
-- URGENT: RE-ENABLE AUTO-APPROVE TRIGGERS + FIX 500 ERRORS
-- ============================================
-- We disabled the triggers earlier - need to re-enable them
-- AND fix the foreign key issue causing 500 errors

-- STEP 1: RE-ENABLE THE AUTO-APPROVE TRIGGERS
-- ============================================
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_trigger;
ALTER TABLE dogs ENABLE TRIGGER auto_approve_existing_client_dogs_on_update_trigger;

SELECT '=== TRIGGERS RE-ENABLED ===' as status;

-- STEP 2: FIX THE FOREIGN KEY NAME ISSUE
-- ============================================
-- PostgREST needs the foreign key to be named exactly: dogs_owner_id_fkey

DO $$
BEGIN
  -- Check if dogs_owner_id_fkey exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'dogs'
    AND constraint_name = 'dogs_owner_id_fkey'
  ) THEN
    -- Drop any existing foreign key on owner_id with a different name
    DECLARE
      fk_name text;
    BEGIN
      SELECT tc.constraint_name INTO fk_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'dogs'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'owner_id'
      LIMIT 1;

      IF fk_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE dogs DROP CONSTRAINT %I', fk_name);
        RAISE NOTICE 'Dropped old foreign key: %', fk_name;
      END IF;
    END;

    -- Create the correctly named foreign key
    ALTER TABLE dogs
      ADD CONSTRAINT dogs_owner_id_fkey
      FOREIGN KEY (owner_id)
      REFERENCES profiles(id)
      ON DELETE CASCADE;

    RAISE NOTICE 'Created dogs_owner_id_fkey';
  ELSE
    RAISE NOTICE 'dogs_owner_id_fkey already exists';
  END IF;
END $$;

-- STEP 3: VERIFY EVERYTHING
-- ============================================
SELECT
  '=== TRIGGER STATUS ===' as info,
  trigger_name,
  event_manipulation,
  CASE tgenabled
    WHEN 'O' THEN '✓ ENABLED'
    WHEN 'D' THEN '✗ DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'dogs'
ORDER BY trigger_name;

SELECT
  '=== FOREIGN KEY STATUS ===' as info,
  tc.constraint_name,
  'dogs.' || kcu.column_name || ' -> ' || ccu.table_name || '.' || ccu.column_name as relationship
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name = 'dogs'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'owner_id';

-- STEP 4: RELOAD POSTGREST SCHEMA CACHE
-- ============================================
NOTIFY pgrst, 'reload schema';

SELECT
  '=== COMPLETE ===' as status,
  '1. Triggers RE-ENABLED for auto-approval
2. Foreign key fixed
3. PostgREST notified
4. Wait 10 seconds then HARD REFRESH browser (Cmd+Shift+R)' as next_steps;
