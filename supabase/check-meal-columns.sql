-- Check which tables have meal columns
SELECT 'bookings' as table_name, column_name
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name IN ('needs_breakfast', 'needs_lunch', 'needs_dinner')
UNION ALL
SELECT 'individual_day_bookings', column_name
FROM information_schema.columns
WHERE table_name = 'individual_day_bookings'
  AND column_name IN ('needs_breakfast', 'needs_lunch', 'needs_dinner')
ORDER BY table_name, column_name;
