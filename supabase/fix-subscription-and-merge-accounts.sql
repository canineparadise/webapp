-- ============================================
-- FIX SUBSCRIPTION AND INVESTIGATE DUPLICATE ACCOUNTS
-- ============================================

-- STEP 1: Find both user accounts
SELECT
  'User 1 (has Azlan dog)' AS account,
  id,
  email,
  first_name,
  last_name,
  created_at
FROM profiles
WHERE id = '02444d34-a77d-4090-ac37-09f6d84c9ecb'

UNION ALL

SELECT
  'User 2 (logged in, buying subscription)' AS account,
  id,
  email,
  first_name,
  last_name,
  created_at
FROM profiles
WHERE id = 'c5e76355-e017-4492-80b5-40ad9a93e379';

-- STEP 2: Find all dogs for each user
SELECT
  'Dogs for User 1' AS owner,
  d.id,
  d.name,
  d.breed,
  d.owner_id,
  d.is_approved,
  d.is_draft
FROM dogs d
WHERE d.owner_id = '02444d34-a77d-4090-ac37-09f6d84c9ecb'

UNION ALL

SELECT
  'Dogs for User 2' AS owner,
  d.id,
  d.name,
  d.breed,
  d.owner_id,
  d.is_approved,
  d.is_draft
FROM dogs d
WHERE d.owner_id = 'c5e76355-e017-4492-80b5-40ad9a93e379';

-- STEP 3: Update the wrong subscription to point to the correct user and dog
-- This will fix subscription idx 2 (sub_1SYXD7K6Riz8AtjEuXvdSoNP)
UPDATE subscriptions
SET
  user_id = '02444d34-a77d-4090-ac37-09f6d84c9ecb',
  dog_id = '24d477aa-861f-488d-92d0-e6cec9b9c4c0',
  updated_at = NOW()
WHERE stripe_subscription_id = 'sub_1SYXD7K6Riz8AtjEuXvdSoNP'
RETURNING id, user_id, dog_id, stripe_subscription_id, tier_id;

-- STEP 4: Deactivate the old subscription with no dog_id (idx 1)
UPDATE subscriptions
SET
  is_active = false,
  updated_at = NOW()
WHERE id = 'a49f3640-4ede-4948-8ea4-526a34febf72'
RETURNING id, user_id, dog_id, is_active, days_remaining;

-- STEP 5: Verify all subscriptions for the correct user
SELECT
  s.id,
  s.user_id,
  s.dog_id,
  d.name AS dog_name,
  s.stripe_subscription_id,
  s.is_active,
  s.days_remaining,
  s.created_at
FROM subscriptions s
LEFT JOIN dogs d ON s.dog_id = d.id
WHERE s.user_id = '02444d34-a77d-4090-ac37-09f6d84c9ecb'
ORDER BY s.created_at DESC;
