-- Check BOOKINGS table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show distinct status values
SELECT DISTINCT status FROM bookings;

-- Check if there's a price or total_amount column
SELECT id, status, price, total_amount, booking_date FROM bookings LIMIT 5;
