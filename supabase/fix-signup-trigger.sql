-- ============================================
-- FIX SIGNUP TRIGGER - Remove invalid columns
-- ============================================

-- Update the handle_new_user function to only use existing columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_existing_client BOOLEAN;
BEGIN
  -- Check if the user's email exists in existing_clients table (case-insensitive)
  SELECT EXISTS (
    SELECT 1 FROM public.existing_clients
    WHERE LOWER(email) = LOWER(NEW.email)
  ) INTO is_existing_client;

  -- Insert profile with appropriate approval status
  IF is_existing_client THEN
    -- Existing client: Auto-approve
    INSERT INTO public.profiles (
      id,
      email,
      approval_status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'approved',           -- Auto-approve existing clients
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- New client: Default pending status
    INSERT INTO public.profiles (
      id,
      email,
      approval_status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'pending',            -- New clients need approval
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the signup
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comment
COMMENT ON FUNCTION public.handle_new_user IS 'Auto-creates profile and auto-approves existing clients on signup - with error handling';
