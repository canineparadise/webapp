-- ============================================
-- AUTO-APPROVE DOGS FOR EXISTING CLIENTS
-- ============================================

-- Create function to auto-approve dogs for existing clients
CREATE OR REPLACE FUNCTION public.auto_approve_existing_client_dogs()
RETURNS trigger AS $$
DECLARE
  user_is_existing_client BOOLEAN;
  user_email TEXT;
BEGIN
  -- Get the user's email from profiles
  SELECT email INTO user_email
  FROM public.profiles
  WHERE id = NEW.user_id;

  -- Check if user's email exists in existing_clients (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM public.existing_clients
    WHERE LOWER(email) = LOWER(user_email)
  ) INTO user_is_existing_client;

  -- If existing client, auto-approve the dog
  IF user_is_existing_client THEN
    NEW.is_approved := TRUE;
    NEW.is_draft := FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs BEFORE INSERT on dogs
DROP TRIGGER IF EXISTS auto_approve_existing_client_dogs_trigger ON public.dogs;

CREATE TRIGGER auto_approve_existing_client_dogs_trigger
  BEFORE INSERT ON public.dogs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_existing_client_dogs();

-- Comment
COMMENT ON FUNCTION public.auto_approve_existing_client_dogs IS 'Auto-approves dogs when added by existing clients';
