-- Check actual columns in subscriptions table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample subscription data
SELECT * FROM subscriptions LIMIT 5;
