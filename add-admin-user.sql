-- ADD ADMIN USER
-- This script creates a new admin user in your system
--
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Replace the placeholder values below with the actual admin details
-- 3. Run this script
-- 4. The user can then sign up using the email you specify here
-- 5. Their account will automatically be set to 'admin' role

-- Step 1: First, the user needs to sign up at your website
-- Go to: http://localhost:3000/signup (or your live URL)
-- Have them create an account with their email and password

-- Step 2: After they sign up, run this to make them an admin:
-- REPLACE 'admin@example.com' with their actual email address

UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Verify it worked:
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE email = 'admin@example.com';

-- The result should show role = 'admin'


-- ============================================
-- ALTERNATIVE: Set multiple users as admin
-- ============================================

-- If you need to add multiple admins at once:
UPDATE profiles
SET role = 'admin'
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);

-- Verify all admins:
SELECT id, email, first_name, last_name, role
FROM profiles
WHERE role = 'admin'
ORDER BY email;


-- ============================================
-- MAKE EXISTING USER AN ADMIN
-- ============================================

-- If you want to promote an existing user to admin:
UPDATE profiles
SET role = 'admin'
WHERE id = 'USER_UUID_HERE';

-- Or by email:
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';


-- ============================================
-- DEMOTE ADMIN BACK TO USER
-- ============================================

-- If you need to remove admin privileges:
UPDATE profiles
SET role = 'user'
WHERE email = 'formeradmin@example.com';
