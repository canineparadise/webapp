-- What date does the database think TODAY is?
SELECT
  CURRENT_DATE as database_current_date,
  NOW() as database_current_timestamp,
  NOW()::date as database_current_date_from_now;

-- Check if there are bookings for the ACTUAL current date
SELECT COUNT(*) as bookings_for_database_current_date
FROM bookings
WHERE booking_date = CURRENT_DATE;

-- Show what dates we DO have bookings for
SELECT DISTINCT booking_date
FROM bookings
ORDER BY booking_date;
