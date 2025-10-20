-- =====================================================
-- FIX PROFILES TRIGGER TO INCLUDE FIRST AND LAST NAME
-- =====================================================
-- This updates the trigger to extract firstName and lastName
-- from the auth.users raw_user_meta_data JSON field
-- =====================================================

-- Update the function to handle new users with metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- The trigger should already exist, but let's make sure
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users that have metadata but no first/last name in profiles
UPDATE public.profiles
SET
  first_name = COALESCE(
    (SELECT raw_user_meta_data->>'firstName' FROM auth.users WHERE id = profiles.id),
    first_name
  ),
  last_name = COALESCE(
    (SELECT raw_user_meta_data->>'lastName' FROM auth.users WHERE id = profiles.id),
    last_name
  ),
  updated_at = NOW()
WHERE
  (first_name IS NULL OR first_name = '')
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = profiles.id
    AND raw_user_meta_data->>'firstName' IS NOT NULL
  );

-- Show updated profiles
SELECT
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  u.raw_user_meta_data->>'firstName' as metadata_first_name,
  u.raw_user_meta_data->>'lastName' as metadata_last_name
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Profile trigger updated to capture first_name and last_name!';
  RAISE NOTICE '✅ Existing profiles updated from auth metadata';
  RAISE NOTICE '';
  RAISE NOTICE '📝 New signups will now automatically get first_name and last_name';
END $$;
