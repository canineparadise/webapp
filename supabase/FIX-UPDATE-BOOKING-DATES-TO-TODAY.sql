-- FIX: Update all booking dates from 2025 to the ACTUAL current dates

-- First, check what today actually is
SELECT CURRENT_DATE as actual_today;

-- Update bookings from 2025-10-07 to CURRENT_DATE (today)
UPDATE bookings
SET booking_date = CURRENT_DATE
WHERE booking_date = '2025-10-07';

-- Update bookings from 2025-10-08 to CURRENT_DATE + 1
UPDATE bookings
SET booking_date = CURRENT_DATE + INTERVAL '1 day'
WHERE booking_date = '2025-10-08';

-- Update bookings from 2025-10-09 to CURRENT_DATE + 2
UPDATE bookings
SET booking_date = CURRENT_DATE + INTERVAL '2 days'
WHERE booking_date = '2025-10-09';

-- Update bookings from 2025-10-10 to CURRENT_DATE + 3
UPDATE bookings
SET booking_date = CURRENT_DATE + INTERVAL '3 days'
WHERE booking_date = '2025-10-10';

-- Verify the changes
SELECT
  booking_date,
  COUNT(*) as num_bookings
FROM bookings
GROUP BY booking_date
ORDER BY booking_date;
