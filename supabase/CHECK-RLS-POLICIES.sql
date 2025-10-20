-- Check if RLS is enabled and what policies exist on bookings table

-- 1. Check if RLS is enabled on bookings
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'bookings';

-- 2. Show all RLS policies on bookings table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings';

-- 3. Check how many bookings exist for each user
SELECT
  user_id,
  COUNT(*) as num_bookings,
  array_agg(booking_date) as dates
FROM bookings
WHERE booking_date = '2025-10-07'
GROUP BY user_id;
