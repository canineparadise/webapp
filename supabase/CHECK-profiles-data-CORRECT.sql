-- Check what data exists in profiles for test users
SELECT
  email,
  first_name,
  last_name,
  phone,
  address,
  city,
  postcode,
  emergency_contact_name,
  emergency_contact_phone,
  role,
  approval_status
FROM profiles
WHERE email LIKE '%@test.com'
ORDER BY email;
