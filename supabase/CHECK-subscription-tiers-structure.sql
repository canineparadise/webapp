-- Check subscription_tiers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_tiers'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM subscription_tiers LIMIT 5;
