-- ============================================
-- EMERGENCY: TEMPORARILY DISABLE RLS
-- ============================================
-- This will restore ALL data access immediately
-- Then we can carefully re-enable with proper policies

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE individual_day_bookings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('profiles', 'dogs', 'bookings', 'subscriptions', 'individual_day_bookings');
