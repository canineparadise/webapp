-- Check the actual structure of assessment tables
SELECT 'ASSESSMENT_SLOTS COLUMNS:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'assessment_slots'
ORDER BY ordinal_position;

SELECT 'ASSESSMENT_BOOKINGS COLUMNS:' AS info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'assessment_bookings'
ORDER BY ordinal_position;

SELECT 'DOGS COLUMNS (assessment related):' AS info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dogs'
  AND (column_name LIKE '%assessment%' OR column_name LIKE '%slot%')
ORDER BY ordinal_position;
