-- Fix Andrew Carrick's missing subscription
-- Email: andrew_carrick@yahoo.co.uk
-- Subscription: Full Day - 4 days/month
-- Amount paid: £110 (£160 - £50 discount)

-- Step 1: Get Andrew's user ID and Harvey's dog ID
-- Run this first to verify the IDs
SELECT
  p.id as user_id,
  p.email,
  p.first_name,
  p.last_name,
  d.id as dog_id,
  d.name as dog_name
FROM profiles p
LEFT JOIN dogs d ON d.owner_id = p.id
WHERE p.email = 'andrew_carrick@yahoo.co.uk';

-- Step 2: Get the tier ID for "Full Day - 4 days"
SELECT id, name, days_per_month, base_price
FROM subscription_tiers
WHERE name ILIKE '%full day%' AND days_per_month = 4;

-- Step 3: Insert the subscription
-- Replace the UUIDs below with the actual IDs from steps 1 and 2
INSERT INTO subscriptions (
  user_id,
  tier_id,
  days_included,
  days_remaining,
  monthly_price,
  price_per_day,
  is_active,
  auto_renew,
  start_date,
  end_date,
  next_billing_date,
  payment_status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM profiles WHERE email = 'andrew_carrick@yahoo.co.uk'),
  (SELECT id FROM subscription_tiers WHERE name ILIKE '%full day%' AND days_per_month = 4 LIMIT 1),
  4,  -- days_included
  4,  -- days_remaining (full month available)
  110.00,  -- monthly_price (£160 - £50 discount)
  27.50,  -- price_per_day (£110 / 4)
  true,  -- is_active
  true,  -- auto_renew
  CURRENT_DATE,  -- start_date
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,  -- end_date (end of current month)
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date,  -- next_billing_date
  'paid',  -- payment_status
  NOW(),
  NOW()
)
RETURNING *;

-- Step 4: Verify the subscription was created
SELECT
  s.*,
  st.name as tier_name,
  p.email as user_email
FROM subscriptions s
JOIN subscription_tiers st ON s.tier_id = st.id
JOIN profiles p ON s.user_id = p.id
WHERE p.email = 'andrew_carrick@yahoo.co.uk'
ORDER BY s.created_at DESC
LIMIT 1;
