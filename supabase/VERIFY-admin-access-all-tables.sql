-- =====================================================
-- VERIFY ADMIN ACCESS TO ALL TABLES
-- Check RLS policies to ensure admins can access everything
-- =====================================================

-- Check all tables in public schema
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS policies for each table
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
