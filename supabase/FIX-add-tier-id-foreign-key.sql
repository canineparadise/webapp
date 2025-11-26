-- Fix: Add foreign key constraint for subscriptions.tier_id -> subscription_tiers.id
-- This is required for Supabase join syntax: subscription_tiers:tier_id(*)

-- First, check if the constraint already exists
DO $$
BEGIN
    -- Drop the constraint if it exists (in case it's misconfigured)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'subscriptions_tier_id_fkey'
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_tier_id_fkey;
    END IF;
END $$;

-- Add the foreign key constraint
ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_tier_id_fkey
FOREIGN KEY (tier_id)
REFERENCES subscription_tiers(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Verify the constraint was added
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name='subscriptions'
AND kcu.column_name = 'tier_id';
