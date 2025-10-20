-- Check what bookings exist and what date is being used
-- First, let's see what today's date is in the database
SELECT CURRENT_DATE as today_in_database;

-- Now let's see all bookings we have
SELECT
  booking_date,
  COUNT(*) as booking_count,
  array_agg(status) as statuses
FROM bookings
GROUP BY booking_date
ORDER BY booking_date;

-- Check if bookings have the dog_ids array populated
SELECT
  id,
  booking_date,
  dog_id,
  dog_ids,
  total_dogs,
  status
FROM bookings
WHERE booking_date = CURRENT_DATE
LIMIT 5;

-- If CURRENT_DATE doesn't match, check for 2025-10-07
SELECT
  id,
  booking_date,
  dog_id,
  dog_ids,
  total_dogs,
  status
FROM bookings
WHERE booking_date = '2025-10-07'
LIMIT 5;
