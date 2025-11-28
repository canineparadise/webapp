-- ============================================
-- SHOW ALL SUBSCRIPTIONS WITH RELATED DATA
-- ============================================

-- Show all subscriptions with user, dog, and tier information
SELECT
  s.id AS subscription_id,
  s.user_id,
  p.email AS user_email,
  p.first_name,
  p.last_name,
  s.dog_id,
  d.name AS dog_name,
  d.is_approved AS dog_approved,
  d.is_draft AS dog_draft,
  s.tier_id,
  t.name AS tier_name,
  t.days_included AS tier_days,
  s.days_included,
  s.days_used,
  s.days_remaining,
  s.monthly_price,
  s.price_per_day,
  s.is_active,
  s.auto_renew,
  s.start_date,
  s.end_date,
  s.next_billing_date,
  s.current_period_start,
  s.current_period_end,
  s.stripe_subscription_id,
  s.payment_status,
  s.created_at,
  s.updated_at
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
LEFT JOIN subscription_tiers t ON s.tier_id = t.id
ORDER BY s.created_at DESC;

-- Show count of subscriptions by status
SELECT
  is_active,
  COUNT(*) as count
FROM subscriptions
GROUP BY is_active;

-- Show subscriptions for the specific user (Andrew Carrick)
SELECT
  s.id,
  s.dog_id,
  d.name AS dog_name,
  d.is_approved,
  d.is_draft,
  s.tier_id,
  t.name AS tier_name,
  s.is_active,
  s.stripe_subscription_id,
  s.created_at
FROM subscriptions s
LEFT JOIN dogs d ON s.dog_id = d.id
LEFT JOIN subscription_tiers t ON s.tier_id = t.id
WHERE s.user_id = '02444d34-a77d-4090-ac37-09f6d84c9ecb'
ORDER BY s.created_at DESC;

-- Show all dogs for this user
SELECT
  id AS dog_id,
  name,
  breed,
  is_approved,
  is_draft,
  owner_id
FROM dogs
WHERE owner_id = '02444d34-a77d-4090-ac37-09f6d84c9ecb'
ORDER BY created_at DESC;
