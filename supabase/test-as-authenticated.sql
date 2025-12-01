-- Test query AS the authenticated role (same as PostgREST)
SET ROLE authenticated;

-- Set a fake JWT claim (required for RLS)
SET request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}';

-- Try the exact query that's failing
SELECT d.*, p.first_name, p.last_name, p.email, p.phone
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
ORDER BY d.name ASC
LIMIT 5;

-- Reset role
RESET ROLE;

SELECT 'Query completed as authenticated role' as result;
