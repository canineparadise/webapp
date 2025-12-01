-- Just reload PostgREST multiple times
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

SELECT 'PostgREST reload signals sent. Wait 30 seconds then test in incognito window.' as instruction;
