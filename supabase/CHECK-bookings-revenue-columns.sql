-- Check bookings table structure for revenue-related columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample booking data
SELECT id, booking_date, status, session_type
FROM bookings
LIMIT 5;
