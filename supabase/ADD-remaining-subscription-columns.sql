-- Add remaining missing columns to subscriptions table

-- Add days_used if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'days_used'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN days_used INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add days_remaining if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'days_remaining'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN days_remaining INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add days_included if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'days_included'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN days_included INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add session_type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'session_type'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN session_type TEXT;
    END IF;
END $$;

-- Add price_per_day if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'price_per_day'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN price_per_day NUMERIC(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add monthly_price if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'monthly_price'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN monthly_price NUMERIC(10,2) DEFAULT 0;
    END IF;
END $$;

-- Verify all columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY column_name;
