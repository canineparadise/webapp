-- Simple script to set up staff and admin users
-- BEFORE running this:
-- 1. Create staff@canineparadise.com in Supabase Auth
-- 2. Create admin@canineparadise.com in Supabase Auth
-- 3. Run this script

-- Set staff role
UPDATE profiles
SET role = 'staff',
    first_name = 'Staff',
    last_name = 'Member',
    phone = '07700900001'
WHERE email = 'staff@canineparadise.com';

-- Set admin role
UPDATE profiles
SET role = 'admin',
    first_name = 'Admin',
    last_name = 'User',
    phone = '07700900002'
WHERE email = 'admin@canineparadise.com';

-- Verify
SELECT email, role, first_name, last_name FROM profiles WHERE role IN ('staff', 'admin');
