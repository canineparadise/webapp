-- Check the EXACT date format the database is using
SELECT
  booking_date,
  booking_date::text as date_as_text,
  '2025-10-07'::date as target_date,
  booking_date = '2025-10-07'::date as matches_target
FROM bookings
WHERE booking_date >= '2025-10-07'
ORDER BY booking_date
LIMIT 5;

-- Check what the staff dashboard query would return
SELECT
  b.id,
  b.booking_date,
  b.dog_ids,
  b.status,
  array_length(b.dog_ids, 1) as num_dogs
FROM bookings b
WHERE b.booking_date = '2025-10-07'
  AND b.status = 'confirmed';
