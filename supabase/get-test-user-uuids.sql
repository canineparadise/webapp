-- Get UUIDs for all test users
SELECT
  email,
  id as uuid
FROM auth.users
WHERE email IN (
  'emma.wilson@test.com',
  'james.brown@test.com',
  'sophie.taylor@test.com',
  'oliver.davis@test.com',
  'amelia.martinez@test.com',
  'liam.evans@test.com',
  'charlotte.moore@test.com',
  'ethan.jackson@test.com',
  'mia.white@test.com',
  'lucas.hall@test.com',
  'grace.allen@test.com',
  'henry.young@test.com',
  'ella.king@test.com',
  'sebastian.wright@test.com',
  'scarlett.lopez@test.com',
  'jack.hill@test.com',
  'isabella.thompson@test.com',
  'noah.anderson@test.com',
  'ava.robinson@test.com',
  'william.harris@test.com'
)
ORDER BY email;
