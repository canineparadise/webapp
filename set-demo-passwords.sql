-- SET PASSWORDS FOR DEMO USERS
-- This uses Supabase admin functions to set passwords

-- Set password for demo admin
SELECT auth.update_user(
  '668b1f4b-bd59-4388-8e64-04d115e988f4'::uuid,
  jsonb_build_object('password', 'admin123')
);

-- Set password for demo staff (replace with actual user ID)
-- Find the ID by running: SELECT id FROM auth.users WHERE email = 'demo.staff@canineparadise.com';
SELECT auth.update_user(
  'STAFF_USER_ID_HERE'::uuid,
  jsonb_build_object('password', 'staff123')
);

-- Set password for demo user (replace with actual user ID)
-- Find the ID by running: SELECT id FROM auth.users WHERE email = 'demo.user@canineparadise.com';
SELECT auth.update_user(
  'USER_ID_HERE'::uuid,
  jsonb_build_object('password', 'user123')
);

-- Verify by checking the updated_at timestamp
SELECT id, email, updated_at FROM auth.users
WHERE email IN (
  'demo.admin@canineparadise.com',
  'demo.staff@canineparadise.com',
  'demo.user@canineparadise.com'
);
