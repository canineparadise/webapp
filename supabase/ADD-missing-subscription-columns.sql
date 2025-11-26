-- Add missing columns to subscriptions table

-- Add current_period_start if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'current_period_start'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMPTZ;
    END IF;
END $$;

-- Add current_period_end if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'current_period_end'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
    END IF;
END $$;

-- Add next_billing_date if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'next_billing_date'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN next_billing_date TIMESTAMPTZ;
    END IF;
END $$;

-- Add stripe_subscription_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT;
    END IF;
END $$;

-- Add stripe_customer_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
    END IF;
END $$;

-- Verify all columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
AND column_name IN (
    'current_period_start',
    'current_period_end', 
    'next_billing_date',
    'stripe_subscription_id',
    'stripe_customer_id'
)
ORDER BY column_name;
