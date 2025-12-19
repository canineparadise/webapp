-- Add extra_day_price columns to subscription_tiers table
-- These columns are needed for the extra days purchase feature

-- Add extra_day_price for full day sessions
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS extra_day_price DECIMAL(10,2);

-- Add half_day_extra_day_price for half day sessions
ALTER TABLE subscription_tiers
ADD COLUMN IF NOT EXISTS half_day_extra_day_price DECIMAL(10,2);

-- Set default values based on the existing price_per_day
-- For full day tiers, set extra_day_price = price_per_day
UPDATE subscription_tiers
SET extra_day_price = price_per_day
WHERE session_type = 'full_day' AND extra_day_price IS NULL;

-- For half day tiers, set half_day_extra_day_price = price_per_day
UPDATE subscription_tiers
SET half_day_extra_day_price = price_per_day
WHERE session_type = 'half_day' AND half_day_extra_day_price IS NULL;

-- Also set cross values for flexibility (full day tiers need half_day price too)
-- Use 75% of full day price for half day on full day tiers
UPDATE subscription_tiers
SET half_day_extra_day_price = price_per_day * 0.75
WHERE session_type = 'full_day' AND half_day_extra_day_price IS NULL;

-- Half day tiers use 133% of half day price for full day extra
UPDATE subscription_tiers
SET extra_day_price = price_per_day * 1.33
WHERE session_type = 'half_day' AND extra_day_price IS NULL;

-- Add comments
COMMENT ON COLUMN subscription_tiers.extra_day_price IS 'Price for purchasing an extra full day beyond subscription allowance';
COMMENT ON COLUMN subscription_tiers.half_day_extra_day_price IS 'Price for purchasing an extra half day beyond subscription allowance';
