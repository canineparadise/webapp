-- ADD USERS DIRECTLY TO PROFILES TABLE
-- This adds user records that you can then use to create Auth accounts
--
-- IMPORTANT: You still need to sign up these users at the website first!
-- This SQL just sets their roles after they sign up.

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Have each person go to: https://canineparadise-p88d.vercel.app/signup
-- 2. They sign up with their email and password
-- 3. After they sign up, YOU run this SQL to set their role

-- ============================================
-- SET ROLES FOR EXISTING USERS
-- ============================================

-- Make someone an ADMIN (replace with their email)
UPDATE profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE@example.com';

-- Make someone STAFF (replace with their email)
UPDATE profiles
SET role = 'staff'
WHERE email = 'STAFF_EMAIL_HERE@example.com';

-- Make someone a USER (they're already 'user' by default, but you can specify)
UPDATE profiles
SET role = 'user'
WHERE email = 'USER_EMAIL_HERE@example.com';

-- ============================================
-- EXAMPLE: Set up demo accounts
-- ============================================
-- After these people sign up at the website, run:

UPDATE profiles SET role = 'admin' WHERE email = 'jenna@acesgrowthsolutions.com';
UPDATE profiles SET role = 'staff' WHERE email = 'claire@test.com';
UPDATE profiles SET role = 'user' WHERE email = 'demo@test.com';

-- ============================================
-- VERIFY ROLES
-- ============================================

SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles
ORDER BY role, email;
