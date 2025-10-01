-- CREATE ADMIN USERS FOR CANINE PARADISE
-- This script creates the three admin users in Supabase Auth and profiles table
--
-- IMPORTANT INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" for each admin below
-- 3. Use the email and password provided
-- 4. Enable "Auto Confirm User" checkbox (so they don't need email verification)
-- 5. After creating each user in the Auth UI, come back here and run the SQL below

-- ============================================
-- ADMIN USERS TO CREATE IN SUPABASE AUTH:
-- ============================================
--
-- Admin 1: Jenna de Beer
-- Email: jenna@acesgrowthsolutions.com
-- Password: Jenna@2025
--
-- Admin 2: Claire Carrick
-- Email: claire@test.com
-- Password: Claire@2025
--
-- Admin 3: Andrew Carrick
-- Email: andrew_carrick@yahoo.com
-- Password: Andrew@2025
--
-- ============================================

-- STEP 1: Create users in Supabase Auth UI first (see instructions above)

-- STEP 2: After creating the auth users, run this SQL to set their profiles as admin:

-- Update Jenna de Beer to admin
UPDATE profiles
SET
  role = 'admin',
  first_name = 'Jenna',
  last_name = 'de Beer'
WHERE email = 'jenna@acesgrowthsolutions.com';

-- Update Claire Carrick to admin
UPDATE profiles
SET
  role = 'admin',
  first_name = 'Claire',
  last_name = 'Carrick'
WHERE email = 'claire@test.com';

-- Update Andrew Carrick to admin
UPDATE profiles
SET
  role = 'admin',
  first_name = 'Andrew',
  last_name = 'Carrick'
WHERE email = 'andrew_carrick@yahoo.com';

-- STEP 3: Verify all admins were created successfully:
SELECT id, email, first_name, last_name, role, created_at
FROM profiles
WHERE email IN (
  'jenna@acesgrowthsolutions.com',
  'claire@test.com',
  'andrew_carrick@yahoo.com'
)
ORDER BY email;

-- The result should show all three users with role = 'admin'

-- ============================================
-- ALTERNATIVE: If users already signed up themselves
-- ============================================
-- If these users already have accounts as regular users,
-- you can just promote them to admin with:

UPDATE profiles
SET role = 'admin'
WHERE email IN (
  'jenna@acesgrowthsolutions.com',
  'claire@test.com',
  'andrew_carrick@yahoo.com'
);
