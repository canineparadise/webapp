-- Check for subscription with the wrong IDs from Stripe webhook
SELECT
  s.id,
  s.user_id,
  s.dog_id,
  s.tier_id,
  t.name AS tier_name,
  s.days_included,
  s.days_remaining,
  s.is_active,
  s.stripe_subscription_id,
  s.created_at
FROM subscriptions s
LEFT JOIN subscription_tiers t ON s.tier_id = t.id
WHERE s.stripe_subscription_id = 'sub_1SYXD7K6Riz8AtjEuXvdSoNP'
OR s.user_id = 'c5e76355-e017-4492-80b5-40ad9a93e379'
OR s.dog_id = '232f26bb-1601-435a-a577-1250cdef3c1b';

-- Check if the wrong user_id exists in profiles
SELECT id, email, first_name, last_name
FROM profiles
WHERE id = 'c5e76355-e017-4492-80b5-40ad9a93e379';

-- Check if the wrong dog_id exists in dogs
SELECT id, name, owner_id, is_approved, is_draft
FROM dogs
WHERE id = '232f26bb-1601-435a-a577-1250cdef3c1b';
