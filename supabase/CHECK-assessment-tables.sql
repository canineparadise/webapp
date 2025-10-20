-- Check what columns exist in assessment tables
SELECT 'assessment_recurring_slots' as table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessment_recurring_slots'
ORDER BY ordinal_position

UNION ALL

SELECT 'assessment_slots', column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessment_slots'
ORDER BY ordinal_position

UNION ALL

SELECT 'assessment_bookings', column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessment_bookings'
ORDER BY ordinal_position;

-- Show current data
SELECT * FROM assessment_recurring_slots LIMIT 5;
SELECT * FROM assessment_slots LIMIT 5;
SELECT * FROM assessment_bookings LIMIT 5;
