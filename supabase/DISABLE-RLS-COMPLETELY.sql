-- DISABLE RLS COMPLETELY ON DOGS AND PROFILES
ALTER TABLE dogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

-- Reload
NOTIFY pgrst, 'reload schema';

SELECT 'RLS DISABLED. Test now.' as instruction;
