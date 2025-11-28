-- ============================================
-- VERIFY WHICH ANDREW ACCOUNT IS CORRECT
-- ============================================

-- Find all profiles with Andrew's email
SELECT
  id,
  email,
  first_name,
  last_name,
  created_at,
  approval_status,
  is_vip_member
FROM profiles
WHERE email ILIKE '%andrew%carrick%'
   OR email = 'andrew_carrick@yahoo.co.uk'
ORDER BY created_at;

-- Find all dogs for user c5e76355-e017-4492-80b5-40ad9a93e379 (current logged in user)
SELECT
  'Current User Dogs' AS label,
  d.id,
  d.name,
  d.breed,
  d.is_approved,
  d.is_draft,
  d.created_at
FROM dogs d
WHERE d.owner_id = 'c5e76355-e017-4492-80b5-40ad9a93e379'
ORDER BY d.created_at;

-- Find all dogs for user 02444d34-a77d-4090-ac37-09f6d84c9ecb (old user)
SELECT
  'Old User Dogs' AS label,
  d.id,
  d.name,
  d.breed,
  d.is_approved,
  d.is_draft,
  d.created_at
FROM dogs d
WHERE d.owner_id = '02444d34-a77d-4090-ac37-09f6d84c9ecb'
ORDER BY d.created_at;

-- Show all active subscriptions for current user
SELECT
  'Current User Subscriptions' AS label,
  s.id,
  s.dog_id,
  d.name AS dog_name,
  s.stripe_subscription_id,
  s.is_active,
  s.days_remaining,
  s.created_at
FROM subscriptions s
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.user_id = 'c5e76355-e017-4492-80b5-40ad9a93e379'
  AND s.is_active = true
ORDER BY s.created_at DESC;

-- Fix the old cancelled subscription to actually be inactive
UPDATE subscriptions
SET
  is_active = false,
  updated_at = NOW()
WHERE id = 'a49f3640-4ede-4948-8ea4-526a34febf72'
  AND user_id = 'c5e76355-e017-4492-80b5-40ad9a93e379'
RETURNING id, stripe_subscription_id, is_active, days_remaining;
