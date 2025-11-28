-- Fix Andrew's old subscription that should be inactive
UPDATE subscriptions
SET is_active = false
WHERE id = 'a49f3640-4ede-4948-8ea4-526a34febf72'
  AND user_id = 'c5e76355-e017-4492-80b5-40ad9a93e379'
  AND days_remaining = 0;

-- Verify Andrew now has only ONE active subscription
SELECT
  id,
  dog_id,
  days_included,
  days_remaining,
  is_active,
  stripe_subscription_id,
  created_at
FROM subscriptions
WHERE user_id = 'c5e76355-e017-4492-80b5-40ad9a93e379'
ORDER BY created_at DESC;
