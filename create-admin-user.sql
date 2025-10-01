-- Create an admin user account
-- You'll need to run this in your Supabase SQL Editor

-- First, check if you already have any users
-- SELECT * FROM auth.users;
-- SELECT * FROM profiles;

-- Option 1: Update an EXISTING user to be an admin
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Option 2: If you need to create a NEW admin user
-- You must first sign up at /signup, then run this to make them admin:
-- UPDATE profiles SET role = 'admin' WHERE email = 'new-admin@example.com';

-- Verify the admin user was created
SELECT
  profiles.id,
  profiles.email,
  profiles.first_name,
  profiles.last_name,
  profiles.role
FROM profiles
WHERE role = 'admin';
