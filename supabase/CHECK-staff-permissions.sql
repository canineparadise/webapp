-- Check staff permissions for all staff/admin users
SELECT
  id,
  email,
  first_name,
  last_name,
  role,
  staff_permissions
FROM profiles
WHERE role IN ('staff', 'admin')
ORDER BY role DESC, email;
