-- Add user_id column to profiles table
-- This is separate from the 'id' column which references auth.users(id)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Optionally create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
