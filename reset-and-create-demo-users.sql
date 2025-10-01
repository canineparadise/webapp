-- RESET AND CREATE DEMO USERS
-- This script deletes old demo users and sets up new ones with correct roles
--
-- IMPORTANT: After running this SQL, you MUST create the users in Supabase Auth UI
-- or have them sign up at the website first!

-- ============================================
-- STEP 1: Delete old demo users from profiles
-- ============================================

DELETE FROM profiles WHERE email IN (
  'demo.user@canineparadise.com',
  'demo.staff@canineparadise.com',
  'demo.admin@canineparadise.com'
);

-- ============================================
-- STEP 2: Delete from Supabase Auth
-- ============================================
-- You need to MANUALLY delete these users from:
-- Supabase Dashboard → Authentication → Users
--
-- Find and delete:
-- - demo.user@canineparadise.com
-- - demo.staff@canineparadise.com
-- - demo.admin@canineparadise.com

-- ============================================
-- STEP 3: Create new users via Signup Page
-- ============================================
-- Go to: https://canineparadise-p88d.vercel.app/signup
--
-- Sign up 3 times with these details:
--
-- User 1 (Admin):
--   First Name: Demo
--   Last Name: Admin
--   Email: demo.admin@canineparadise.com
--   Password: admin123
--   Phone: 07123456789
--
-- User 2 (Staff):
--   First Name: Demo
--   Last Name: Staff
--   Email: demo.staff@canineparadise.com
--   Password: staff123
--   Phone: 07123456780
--
-- User 3 (User):
--   First Name: Demo
--   Last Name: Client
--   Email: demo.user@canineparadise.com
--   Password: user123
--   Phone: 07123456781

-- ============================================
-- STEP 4: After signing up, run this SQL to set roles
-- ============================================

UPDATE profiles
SET role = 'admin'
WHERE email = 'demo.admin@canineparadise.com';

UPDATE profiles
SET role = 'staff'
WHERE email = 'demo.staff@canineparadise.com';

UPDATE profiles
SET role = 'user'
WHERE email = 'demo.user@canineparadise.com';

-- ============================================
-- STEP 5: Verify the users were created correctly
-- ============================================

SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  created_at
FROM profiles
WHERE email IN (
  'demo.user@canineparadise.com',
  'demo.staff@canineparadise.com',
  'demo.admin@canineparadise.com'
)
ORDER BY role;

-- You should see all 3 users with correct roles
