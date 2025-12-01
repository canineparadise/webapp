-- Verify RLS is actually disabled
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('dogs', 'profiles')
ORDER BY tablename;
