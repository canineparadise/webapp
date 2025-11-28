-- ============================================
-- DEBUG AND FIX AUTO-APPROVAL FOR EXISTING CLIENTS
-- ============================================

-- Step 1: Check if Andrew's email is in existing_clients
SELECT
  'Checking if user exists in existing_clients' as step,
  email,
  name
FROM existing_clients
WHERE email ILIKE '%andrew%'
ORDER BY email;

-- Step 2: Check current trigger and function
SELECT
  'Current trigger info' as step,
  tgname as trigger_name,
  tgtype,
  tgenabled
FROM pg_trigger
WHERE tgname = 'auto_approve_existing_client_dogs_trigger';

-- Step 3: Fix the trigger with better error handling and logging
CREATE OR REPLACE FUNCTION public.auto_approve_existing_client_dogs()
RETURNS trigger AS $$
DECLARE
  user_is_existing_client BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get the user's email from profiles (dogs table uses owner_id)
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = NEW.owner_id;

  -- If we couldn't find the email, just return without changes
  IF user_email IS NULL THEN
    RAISE NOTICE 'Could not find email for owner_id: %', NEW.owner_id;
    RETURN NEW;
  END IF;

  RAISE NOTICE 'Checking email: %', user_email;

  -- Check if user's email exists in existing_clients (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM public.existing_clients
    WHERE LOWER(email) = LOWER(user_email)
  ) INTO user_is_existing_client;

  RAISE NOTICE 'Is existing client: %', user_is_existing_client;

  -- If existing client, auto-approve the dog
  IF user_is_existing_client THEN
    RAISE NOTICE 'Auto-approving dog for existing client: %', user_email;
    NEW.is_approved := TRUE;
    NEW.is_draft := FALSE;
  ELSE
    RAISE NOTICE 'Not an existing client: %', user_email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS auto_approve_existing_client_dogs_trigger ON public.dogs;

CREATE TRIGGER auto_approve_existing_client_dogs_trigger
  BEFORE INSERT ON public.dogs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_existing_client_dogs();

-- Step 4: Also add an UPDATE trigger to fix existing pending dogs
CREATE OR REPLACE FUNCTION public.fix_existing_client_pending_dogs()
RETURNS void AS $$
BEGIN
  -- Update all pending dogs for existing clients to approved
  UPDATE public.dogs
  SET
    is_approved = TRUE,
    is_draft = FALSE
  WHERE is_approved = FALSE
  AND owner_id IN (
    SELECT p.id
    FROM public.profiles p
    INNER JOIN public.existing_clients ec ON LOWER(p.email) = LOWER(ec.email)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix function to approve any existing pending dogs
SELECT public.fix_existing_client_pending_dogs();

-- Step 5: Verify - Show all dogs for existing clients
SELECT
  'Dogs for existing clients' as step,
  d.name as dog_name,
  d.is_approved,
  d.is_draft,
  p.email as owner_email,
  CASE
    WHEN ec.email IS NOT NULL THEN 'YES - Existing Client'
    ELSE 'NO - New Client'
  END as is_existing_client
FROM dogs d
INNER JOIN profiles p ON d.owner_id = p.id
LEFT JOIN existing_clients ec ON LOWER(p.email) = LOWER(ec.email)
ORDER BY d.created_at DESC
LIMIT 20;

-- Comment
COMMENT ON FUNCTION public.auto_approve_existing_client_dogs IS 'Auto-approves dogs when added by existing clients - with logging';
COMMENT ON FUNCTION public.fix_existing_client_pending_dogs IS 'One-time fix to approve existing pending dogs for existing clients';
