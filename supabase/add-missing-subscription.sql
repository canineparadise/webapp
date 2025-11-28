-- ============================================
-- ADD MISSING SUBSCRIPTION FROM STRIPE
-- Subscription created at 4:16 PM on Nov 28, 2025
-- ============================================

-- Subscription details from Stripe:
-- User ID: 02444d34-a77d-4090-ac37-09f6d84c9ecb
-- Dog ID: 24d477aa-861f-488d-92d0-e6cec9b9c4c0
-- Tier ID: b63d966c-c152-4151-83a1-dd60105e7f9c
-- Tier: Plus - 12 Days/Month
-- Monthly Price: £444 (discounted to £399.60 with FIRST50)
-- Price Per Day: £37
-- Stripe Subscription ID: sub_1SYULcK6Riz8AtjEPiDjgdJh
-- Session ID: cs_live_a1OBGP7WGFGAhJV050ngBnkNyhN2VqtxruI9qvhQbbA8K4rGDwnIRSqNg3

-- First check if this subscription already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM subscriptions
    WHERE stripe_subscription_id = 'sub_1SYULcK6Riz8AtjEPiDjgdJh'
  ) THEN
    INSERT INTO subscriptions (
      user_id,
      dog_id,
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
      current_period_start,
      current_period_end,
      stripe_subscription_id,
      payment_status,
      created_at,
      updated_at
    ) VALUES (
      '02444d34-a77d-4090-ac37-09f6d84c9ecb', -- user_id
      '24d477aa-861f-488d-92d0-e6cec9b9c4c0', -- dog_id
      'b63d966c-c152-4151-83a1-dd60105e7f9c', -- tier_id (Plus - 12 Days/Month)
      12,                                       -- days_included
      12,                                       -- days_remaining (full amount since just purchased)
      444.00,                                   -- monthly_price (original price before discount)
      37.00,                                    -- price_per_day
      true,                                     -- is_active
      true,                                     -- auto_renew
      '2025-11-28',                            -- start_date
      '2025-12-28',                            -- end_date (30 days from start)
      '2025-12-28',                            -- next_billing_date
      '2025-11-28T16:16:43Z',                  -- current_period_start
      '2025-12-28T16:16:43Z',                  -- current_period_end
      'sub_1SYULcK6Riz8AtjEPiDjgdJh',         -- stripe_subscription_id
      'paid',                                   -- payment_status
      '2025-11-28T16:16:43Z',                  -- created_at
      NOW()                                     -- updated_at
    );
    RAISE NOTICE 'Subscription created successfully';
  ELSE
    RAISE NOTICE 'Subscription already exists, skipping insert';
  END IF;
END $$;

-- Verify the subscription was created
SELECT
  s.id,
  s.user_id,
  p.email as user_email,
  p.first_name,
  p.last_name,
  d.name as dog_name,
  t.name as tier_name,
  s.days_included,
  s.days_remaining,
  s.monthly_price,
  s.is_active,
  s.stripe_subscription_id,
  s.start_date,
  s.end_date
FROM subscriptions s
LEFT JOIN profiles p ON s.user_id = p.id
LEFT JOIN dogs d ON s.dog_id = d.id
LEFT JOIN subscription_tiers t ON s.tier_id = t.id
WHERE s.stripe_subscription_id = 'sub_1SYULcK6Riz8AtjEPiDjgdJh';
