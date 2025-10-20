-- Check what columns exist in assessment_recurring_slots
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessment_recurring_slots'
ORDER BY ordinal_position;

-- Check what columns exist in assessment_slots
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessment_slots'
ORDER BY ordinal_position;

-- Check what columns exist in assessment_bookings
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'assessment_bookings'
ORDER BY ordinal_position;

-- Show current data in assessment_recurring_slots
SELECT * FROM assessment_recurring_slots LIMIT 5;

-- Show current data in assessment_slots
SELECT * FROM assessment_slots LIMIT 5;

-- Show current data in assessment_bookings
SELECT * FROM assessment_bookings LIMIT 5;
