-- Check if test data already exists
SELECT
  'Profiles' as table_name,
  COUNT(*) as count
FROM profiles
WHERE email LIKE '%@test.com'

UNION ALL

SELECT
  'Dogs' as table_name,
  COUNT(*) as count
FROM dogs
WHERE owner_id IN (SELECT id FROM profiles WHERE email LIKE '%@test.com')

UNION ALL

SELECT
  'Subscriptions' as table_name,
  COUNT(*) as count
FROM subscriptions
WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%@test.com')

UNION ALL

SELECT
  'Legal Agreements' as table_name,
  COUNT(*) as count
FROM legal_agreements
WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%@test.com');
