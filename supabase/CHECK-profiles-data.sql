-- Check what data exists in profiles for test users
SELECT
  id,
  email,
  first_name,
  last_name,
  phone,
  address_line1,
  city,
  postcode,
  role,
  is_approved,
  created_at
FROM profiles
WHERE email LIKE '%@test.com'
ORDER BY email;
