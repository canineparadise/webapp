-- ============================================
-- DIAGNOSE THE ACTUAL 500 ERROR
-- ============================================

-- TEST 1: Simple dogs query (no join)
SELECT 'TEST 1: Simple dogs query' as test, id, name FROM dogs LIMIT 1;

-- TEST 2: Simple profiles query
SELECT 'TEST 2: Simple profiles query' as test, id, first_name FROM profiles LIMIT 1;

-- TEST 3: The exact join that's failing in PostgREST
SELECT 'TEST 3: Dogs with profiles join' as test, d.id, d.name, p.first_name, p.last_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
LIMIT 1;

-- TEST 4: Check RLS status
SELECT 'TEST 4: RLS enabled?' as test, tablename, rowsecurity
FROM pg_tables WHERE tablename IN ('dogs', 'profiles');

-- TEST 5: Show current policies
SELECT 'TEST 5: Policies' as test, tablename, policyname, cmd, qual::text
FROM pg_policies WHERE tablename IN ('dogs', 'profiles')
ORDER BY tablename, policyname;

-- TEST 6: Check for any errors in trigger functions
SELECT 'TEST 6: Trigger functions' as test, proname, prosecdef as security_definer
FROM pg_proc WHERE proname LIKE 'auto_approve%';

-- TEST 7: Try to reload PostgREST one more time
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

SELECT 'DONE - Check results above' as status;
