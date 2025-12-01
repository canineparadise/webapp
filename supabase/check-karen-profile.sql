-- ============================================
-- CHECK KAREN'S PROFILE
-- ============================================
-- This script checks if Karen's profile exists and shows her current status

-- Search for Karen with exact email
SELECT
  id,
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type,
  vip_granted_at,
  created_at
FROM profiles
WHERE email = 'karenjenk@hotmail.co.uk';

-- Search for profiles with similar email (case-insensitive, partial match)
SELECT
  id,
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type,
  created_at
FROM profiles
WHERE email ILIKE '%karen%jenk%'
   OR email ILIKE '%karenjenk%'
ORDER BY created_at DESC;

-- Search by name
SELECT
  id,
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type,
  created_at
FROM profiles
WHERE (first_name ILIKE '%karen%' OR last_name ILIKE '%jenk%')
ORDER BY created_at DESC
LIMIT 10;

-- Check if VIP columns exist in profiles table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('is_vip_member', 'vip_badge_type', 'vip_granted_at');

-- Show all profiles with VIP status (if any exist)
SELECT
  email,
  first_name,
  last_name,
  is_vip_member,
  vip_badge_type,
  vip_granted_at
FROM profiles
WHERE is_vip_member = TRUE;
