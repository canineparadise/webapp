-- Check what roll calls exist for today
SELECT * FROM roll_calls WHERE date = CURRENT_DATE;

-- Check ALL roll calls
SELECT * FROM roll_calls ORDER BY created_at DESC LIMIT 10;

-- Check the table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'roll_calls'
ORDER BY ordinal_position;
