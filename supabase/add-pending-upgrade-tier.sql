-- Add pending_upgrade_tier_id column to subscriptions table
-- This column stores the tier_id for scheduled upgrades that will take effect on next billing

ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS pending_upgrade_tier_id UUID REFERENCES subscription_tiers(id);

-- Add comment explaining the column
COMMENT ON COLUMN subscriptions.pending_upgrade_tier_id IS 'Tier ID for scheduled upgrade that will be applied on next billing cycle';
