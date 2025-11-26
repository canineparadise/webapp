-- Add FIRST50 discount code to database
-- This matches the Stripe coupon created in the dashboard

INSERT INTO discount_codes (
  code,
  discount_type,
  discount_value,
  applies_to,
  max_uses,
  current_uses,
  valid_from,
  valid_until,
  is_active,
  description
) VALUES (
  'FIRST50',
  'percentage',
  10.00,
  ARRAY['subscription']::text[],
  50,
  0,
  NOW(),
  NULL,
  true,
  'First 50 users get 10% off for life on subscriptions'
)
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  applies_to = EXCLUDED.applies_to,
  max_uses = EXCLUDED.max_uses,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description;

-- Verify it was added
SELECT * FROM discount_codes WHERE code = 'FIRST50';
