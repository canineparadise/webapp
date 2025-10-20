-- Check what the ADMIN portal would see

-- Admin portal typically shows ALL users (not just approved)
SELECT
  id,
  email,
  first_name,
  last_name,
  approval_status,
  role,
  created_at
FROM profiles
WHERE role = 'user'  -- Exclude staff/admin from counts
ORDER BY created_at DESC
LIMIT 20;

-- Count users by role
SELECT
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role;
