-- Create the FIRST50 discount code that matches the Stripe coupon
INSERT INTO discount_codes (
  code,
  discount_type,
  discount_value,
  applies_to,
  max_uses,
  current_uses,
  valid_from,
  valid_until,
  is_active
) VALUES (
  'FIRST50',
  'percentage',
  10,
  'subscription',
  50,
  0,
  NOW(),
  NULL, -- No expiry date
  true
);

-- Verify it was created
SELECT * FROM discount_codes WHERE code = 'FIRST50';
