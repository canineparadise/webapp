-- ============================================
-- UPDATE PROFILE TRIGGER TO AUTO-APPROVE EXISTING CLIENTS
-- ============================================

-- Update the handle_new_user function to check for existing clients
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
    -- Existing client: Auto-approve, mark as assessment completed
    INSERT INTO public.profiles (
      id,
      email,
      approval_status,
      assessment_completed,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      'approved',           -- Auto-approve existing clients
      TRUE,                 -- No assessment needed
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- New client: Default pending status
    INSERT INTO public.profiles (
      id,
      email,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger already exists from fix_profiles_trigger.sql, but let's recreate it to be sure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comment
COMMENT ON FUNCTION public.handle_new_user IS 'Auto-creates profile and auto-approves existing clients on signup';
