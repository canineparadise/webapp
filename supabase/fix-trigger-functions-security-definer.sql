-- ============================================
-- FIX AUTO-APPROVE TRIGGER FUNCTIONS
-- ============================================
-- The trigger functions might be hitting RLS issues
-- We need to recreate them with SECURITY DEFINER to bypass RLS

-- STEP 1: VIEW CURRENT TRIGGER FUNCTION CODE
-- ============================================
SELECT
  '=== CURRENT TRIGGER FUNCTIONS ===' as info,
  proname,
  prosecdef as is_security_definer,
  pg_get_functiondef(oid) as function_code
FROM pg_proc
WHERE proname IN (
  'auto_approve_existing_client_dogs',
  'auto_approve_existing_client_dogs_on_update'
);

-- STEP 2: RECREATE auto_approve_existing_client_dogs WITH SECURITY DEFINER
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_existing_client_dogs()
RETURNS TRIGGER
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  has_approved_dog BOOLEAN;
BEGIN
  -- Check if the owner already has at least one approved dog
  SELECT EXISTS (
    SELECT 1
    FROM dogs
    WHERE owner_id = NEW.owner_id
      AND is_approved = true
      AND id != NEW.id  -- Don't count the current dog
  ) INTO has_approved_dog;

  -- If they have an approved dog, auto-approve this new dog
  IF has_approved_dog THEN
    NEW.is_approved := true;
    RAISE NOTICE 'Auto-approved dog % for existing client %', NEW.name, NEW.owner_id;
  END IF;

  RETURN NEW;
END;
$$;

-- STEP 3: RECREATE auto_approve_existing_client_dogs_on_update WITH SECURITY DEFINER
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_existing_client_dogs_on_update()
RETURNS TRIGGER
SECURITY DEFINER  -- This bypasses RLS
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  has_approved_dog BOOLEAN;
BEGIN
  -- Only run if the dog is not already approved
  IF NEW.is_approved = false OR NEW.is_approved IS NULL THEN
    -- Check if the owner already has at least one approved dog
    SELECT EXISTS (
      SELECT 1
      FROM dogs
      WHERE owner_id = NEW.owner_id
        AND is_approved = true
        AND id != NEW.id  -- Don't count the current dog
    ) INTO has_approved_dog;

    -- If they have an approved dog, auto-approve this dog
    IF has_approved_dog THEN
      NEW.is_approved := true;
      RAISE NOTICE 'Auto-approved dog % for existing client % on update', NEW.name, NEW.owner_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- STEP 4: VERIFY FUNCTIONS ARE NOW SECURITY DEFINER
-- ============================================
SELECT
  '=== VERIFY SECURITY DEFINER ===' as info,
  proname,
  CASE prosecdef
    WHEN true THEN '✓ SECURITY DEFINER (bypasses RLS)'
    ELSE '✗ NOT SECURITY DEFINER'
  END as security_status
FROM pg_proc
WHERE proname IN (
  'auto_approve_existing_client_dogs',
  'auto_approve_existing_client_dogs_on_update'
);

-- STEP 5: VERIFY TRIGGERS ARE ENABLED
-- ============================================
SELECT
  '=== TRIGGER STATUS ===' as info,
  trigger_name,
  CASE tgenabled
    WHEN 'O' THEN '✓ ENABLED'
    WHEN 'D' THEN '✗ DISABLED'
    ELSE 'UNKNOWN'
  END as status
FROM information_schema.triggers t
JOIN pg_trigger pt ON pt.tgname = t.trigger_name
WHERE event_object_table = 'dogs'
  AND trigger_name LIKE 'auto_approve%'
ORDER BY trigger_name;

-- STEP 6: RELOAD POSTGREST
-- ============================================
NOTIFY pgrst, 'reload schema';

SELECT
  '=== FIX COMPLETE ===' as status,
  'Trigger functions now use SECURITY DEFINER to bypass RLS.
Auto-approve will work without RLS conflicts.
Wait 10 seconds then hard refresh browser.' as next_steps;
