-- ============================================
-- ADD UPDATE TRIGGER FOR EXISTING CLIENT DOGS
-- This handles when a draft is finalized
-- ============================================

-- Create UPDATE trigger function
CREATE OR REPLACE FUNCTION public.auto_approve_existing_client_dogs_on_update()
RETURNS trigger AS $$
DECLARE
  user_is_existing_client BOOLEAN;
  user_email TEXT;
BEGIN
  -- Only process if changing from draft to non-draft
  IF OLD.is_draft = TRUE AND NEW.is_draft = FALSE THEN
    -- Get the user's email from profiles
    SELECT email INTO user_email
    FROM public.profiles
    WHERE id = NEW.owner_id;

    IF user_email IS NULL THEN
      RETURN NEW;
    END IF;

    -- Check if user's email exists in existing_clients
    SELECT EXISTS (
      SELECT 1 FROM public.existing_clients
      WHERE LOWER(email) = LOWER(user_email)
    ) INTO user_is_existing_client;

    -- If existing client, auto-approve the dog
    IF user_is_existing_client THEN
      RAISE NOTICE 'Auto-approving finalized dog for existing client: %', user_email;
      NEW.is_approved := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the UPDATE trigger
DROP TRIGGER IF EXISTS auto_approve_existing_client_dogs_on_update_trigger ON public.dogs;

CREATE TRIGGER auto_approve_existing_client_dogs_on_update_trigger
  BEFORE UPDATE ON public.dogs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_existing_client_dogs_on_update();

-- Comment
COMMENT ON FUNCTION public.auto_approve_existing_client_dogs_on_update IS 'Auto-approves dogs when finalized from draft for existing clients';

-- Now fix any existing finalized dogs that should be approved
UPDATE dogs
SET is_approved = TRUE
WHERE is_draft = FALSE
AND is_approved = FALSE
AND owner_id IN (
  SELECT p.id
  FROM profiles p
  INNER JOIN existing_clients ec ON LOWER(p.email) = LOWER(ec.email)
);

-- Verify
SELECT
  d.name,
  d.is_approved,
  d.is_draft,
  p.email as owner_email
FROM dogs d
INNER JOIN profiles p ON d.owner_id = p.id
LEFT JOIN existing_clients ec ON LOWER(p.email) = LOWER(ec.email)
WHERE ec.email IS NOT NULL
ORDER BY d.created_at DESC
LIMIT 10;
