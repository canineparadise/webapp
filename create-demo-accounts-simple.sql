-- CREATE DEMO ACCOUNTS FOR CLIENT PREVIEW
-- Simple version - just sets up the user accounts with correct roles
--
-- DEMO CREDENTIALS:
-- User Portal:   demo.user@canineparadise.com / DemoUser2025!
-- Staff Portal:  demo.staff@canineparadise.com / DemoStaff2025!
-- Admin Portal:  demo.admin@canineparadise.com / DemoAdmin2025!

-- ============================================
-- STEP 1: Create users in Supabase Auth UI
-- ============================================
-- 1. Go to: Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" for each one below
-- 3. Check "Auto Confirm User" for each
--
-- User 1 (Demo Client):
--   Email: demo.user@canineparadise.com
--   Password: DemoUser2025!
--
-- User 2 (Demo Staff):
--   Email: demo.staff@canineparadise.com
--   Password: DemoStaff2025!
--
-- User 3 (Demo Admin):
--   Email: demo.admin@canineparadise.com
--   Password: DemoAdmin2025!
--
-- ============================================

-- STEP 2: After creating users in Auth UI, run this SQL:

-- Update Demo User profile (regular client)
UPDATE profiles
SET
  role = 'user',
  first_name = 'Demo',
  last_name = 'Client'
WHERE email = 'demo.user@canineparadise.com';

-- Update Demo Staff profile
UPDATE profiles
SET
  role = 'staff',
  first_name = 'Demo',
  last_name = 'Staff'
WHERE email = 'demo.staff@canineparadise.com';

-- Update Demo Admin profile
UPDATE profiles
SET
  role = 'admin',
  first_name = 'Demo',
  last_name = 'Admin'
WHERE email = 'demo.admin@canineparadise.com';

-- STEP 3: Verify all demo accounts were created successfully
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

-- You should see all 3 users with their correct roles (admin, staff, user)
