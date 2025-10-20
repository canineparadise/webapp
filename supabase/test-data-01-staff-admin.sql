-- =====================================================
-- TEST DATA SCRIPT 1: STAFF AND ADMIN USERS
-- =====================================================
-- This creates 1 admin and 1 staff user
-- =====================================================

-- First, you need to create these users in Supabase Auth manually:
-- Go to Authentication > Users > Invite User
-- 1. staff@canineparadise.com (password: TestStaff123!)
-- 2. admin@canineparadise.com (password: TestAdmin123!)

-- After creating them in Auth, get their user IDs and update the profiles
-- You can find the IDs by running: SELECT id, email FROM auth.users;

-- For now, I'll use placeholder UUIDs - you'll need to replace these with real ones from auth.users

-- INSERT STAFF USER PROFILE (replace UUID with actual auth.users ID)
INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, 'staff@canineparadise.com', 'Sarah', 'Johnson', '07700900001', '123 Staff Lane', 'Manchester', 'M1 1AA', 'John Johnson', '07700900002', 'staff', 'approved', NOW(), NOW());

-- INSERT ADMIN USER PROFILE (replace UUID with actual auth.users ID)
INSERT INTO profiles (id, email, first_name, last_name, phone, address, city, postcode, emergency_contact_name, emergency_contact_phone, role, approval_status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000002'::uuid, 'admin@canineparadise.com', 'Michael', 'Smith', '07700900003', '456 Admin Avenue', 'Manchester', 'M2 2BB', 'Emma Smith', '07700900004', 'admin', 'approved', NOW(), NOW());

-- INSTRUCTIONS:
-- 1. Create staff@canineparadise.com in Supabase Auth
-- 2. Create admin@canineparadise.com in Supabase Auth
-- 3. Run: SELECT id, email FROM auth.users WHERE email IN ('staff@canineparadise.com', 'admin@canineparadise.com');
-- 4. Replace the UUIDs above with the actual IDs from step 3
-- 5. Run this script
