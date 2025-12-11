-- ============================================
-- FIX RLS AFTER SUPABASE PRO UPGRADE
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS on all main tables
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE individual_day_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers DISABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE legal_agreements DISABLE ROW LEVEL SECURITY;
ALTER TABLE dog_medications DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments DISABLE ROW LEVEL SECURITY;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Verify RLS is disabled
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('dogs', 'profiles', 'bookings', 'subscriptions', 'individual_day_bookings', 'assessment_bookings')
ORDER BY tablename;
