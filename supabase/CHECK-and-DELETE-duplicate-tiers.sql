-- Check for duplicate subscription tiers
SELECT id, name, days_included, price_per_day, created_at
FROM subscription_tiers
ORDER BY days_included, created_at;

-- Delete duplicate tiers (keep only the oldest one for each days_included)
-- UNCOMMENT BELOW TO DELETE DUPLICATES:
/*
DELETE FROM subscription_tiers
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY days_included ORDER BY created_at ASC) as rn
    FROM subscription_tiers
  ) t
  WHERE rn > 1
);
*/

-- Verify after deletion
SELECT id, name, days_included, price_per_day, created_at
FROM subscription_tiers
ORDER BY days_included;
