-- ============================================
-- FIX AUTO-APPROVE TRIGGER - EXISTING CLIENTS ONLY
-- ============================================
-- The trigger was incorrectly changed to auto-approve dogs for ANY user
-- who already has an approved dog. This is WRONG.
-- The correct behavior is to ONLY auto-approve for users whose email
-- is in the existing_clients table.

-- STEP 1: FIX auto_approve_existing_client_dogs (INSERT trigger)
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_existing_client_dogs()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_is_existing_client BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get the user's email from profiles
  SELECT email INTO user_email
  FROM profiles
  WHERE id = NEW.owner_id;

  -- If we couldn't find the email, don't auto-approve
  IF user_email IS NULL THEN
    RAISE NOTICE 'Could not find email for owner_id: %', NEW.owner_id;
    RETURN NEW;
  END IF;

  -- Check if user's email exists in existing_clients (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM existing_clients
    WHERE LOWER(email) = LOWER(user_email)
  ) INTO user_is_existing_client;

  -- ONLY auto-approve if they are in the existing_clients table
  IF user_is_existing_client THEN
    RAISE NOTICE 'Auto-approving dog for EXISTING CLIENT: %', user_email;
    NEW.is_approved := TRUE;
    NEW.is_draft := FALSE;
  END IF;

  RETURN NEW;
END;
$$;

-- STEP 2: FIX auto_approve_existing_client_dogs_on_update (UPDATE trigger)
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_existing_client_dogs_on_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_is_existing_client BOOLEAN;
  user_email TEXT;
BEGIN
  -- Only process if changing from draft to non-draft
  IF OLD.is_draft = TRUE AND NEW.is_draft = FALSE THEN
    -- Get the user's email from profiles
    SELECT email INTO user_email
    FROM profiles
    WHERE id = NEW.owner_id;

    -- If we couldn't find the email, don't auto-approve
    IF user_email IS NULL THEN
      RETURN NEW;
    END IF;

    -- Check if user's email exists in existing_clients (case-insensitive)
    SELECT EXISTS (
      SELECT 1 FROM existing_clients
      WHERE LOWER(email) = LOWER(user_email)
    ) INTO user_is_existing_client;

    -- ONLY auto-approve if they are in the existing_clients table
    IF user_is_existing_client THEN
      RAISE NOTICE 'Auto-approving finalized dog for EXISTING CLIENT: %', user_email;
      NEW.is_approved := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- STEP 3: Verify the fix
-- ============================================
SELECT
  '=== TRIGGER FUNCTIONS FIXED ===' as info,
  'The auto-approve triggers now correctly check the existing_clients table.' as status;

-- STEP 4: Un-approve Atlas since it was incorrectly auto-approved
-- ============================================
-- NOTE: Run this to fix Atlas specifically
UPDATE dogs
SET is_approved = FALSE
WHERE name = 'Atlas'
AND owner_id IN (
  SELECT id FROM profiles WHERE email = 'jennadebeer1989@icloud.com'
);

SELECT
  '=== ATLAS FIX ===' as info,
  name,
  is_approved,
  is_draft
FROM dogs
WHERE name = 'Atlas'
AND owner_id IN (
  SELECT id FROM profiles WHERE email = 'jennadebeer1989@icloud.com'
);

-- STEP 5: Reload schema
-- ============================================
NOTIFY pgrst, 'reload schema';
