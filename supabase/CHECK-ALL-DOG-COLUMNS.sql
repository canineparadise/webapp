-- Get ALL columns from dogs table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dogs'
ORDER BY ordinal_position;

-- Get a sample dog with all fields
SELECT *
FROM dogs
WHERE is_approved = true
LIMIT 1;
