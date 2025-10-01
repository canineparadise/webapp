-- Fix user_id to auto-populate with the auth user's id

-- Option 1: Update existing profiles to set user_id = id
UPDATE profiles
SET user_id = id::text
WHERE user_id IS NULL;

-- Option 2: Create a trigger to auto-populate user_id on insert/update
CREATE OR REPLACE FUNCTION populate_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is NULL, set it to the id
  IF NEW.user_id IS NULL THEN
    NEW.user_id := NEW.id::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS set_user_id ON profiles;

-- Create trigger
CREATE TRIGGER set_user_id
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION populate_user_id();

-- Verify it worked
SELECT id, user_id, email, first_name, last_name
FROM profiles
WHERE email = 'test@canine.com';
