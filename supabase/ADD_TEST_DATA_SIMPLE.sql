-- ============================================
-- CANINE PARADISE - SIMPLE TEST DATA (Using Existing Users)
-- ============================================
-- This script uses your EXISTING authenticated users
-- Run this to find your user IDs first, then we'll add test data
-- ============================================

-- STEP 1: Show existing authenticated users
SELECT
  'EXISTING USERS - Use these IDs for test data' AS info,
  au.id,
  au.email,
  au.created_at,
  p.first_name,
  p.last_name,
  p.role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

-- STEP 2: Show count of users
SELECT
  'Total authenticated users: ' || COUNT(*)::TEXT AS summary
FROM auth.users;

-- If you have NO users yet, you'll need to:
-- 1. Sign up users through your app at /signup
-- 2. Or create them via Supabase dashboard (Authentication > Users > Add User)
-- 3. Then run this script to see their IDs
-- 4. Then we'll create test dogs, bookings, subscriptions using those IDs

-- INSTRUCTIONS:
-- Copy the user IDs from the results above
-- Then I'll create a test data script using YOUR actual user IDs
