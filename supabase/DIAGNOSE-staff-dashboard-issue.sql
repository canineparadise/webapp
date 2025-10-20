-- DIAGNOSE: Why staff dashboard shows no dogs

-- 1. Check today's date in database
SELECT CURRENT_DATE as database_today;

-- 2. Check how many bookings exist for today with status 'confirmed'
SELECT COUNT(*) as confirmed_bookings_today
FROM bookings
WHERE booking_date = CURRENT_DATE
  AND status = 'confirmed';

-- 3. Check if dog_ids arrays are populated
SELECT
  id,
  booking_date,
  dog_ids,
  CASE
    WHEN dog_ids IS NULL THEN 'NULL'
    WHEN dog_ids = '{}' THEN 'EMPTY'
    ELSE 'HAS DATA'
  END as dog_ids_status,
  array_length(dog_ids, 1) as num_dogs,
  status
FROM bookings
WHERE booking_date = CURRENT_DATE
ORDER BY id
LIMIT 20;

-- 4. Extract all dog IDs from today's bookings (mimics staff dashboard logic)
SELECT
  unnest(dog_ids) as dog_id
FROM bookings
WHERE booking_date = CURRENT_DATE
  AND status = 'confirmed';

-- 5. Count total unique dogs today
SELECT COUNT(DISTINCT dog_id) as total_unique_dogs
FROM (
  SELECT unnest(dog_ids) as dog_id
  FROM bookings
  WHERE booking_date = CURRENT_DATE
    AND status = 'confirmed'
) subquery;

-- 6. Check if there are ANY bookings at all
SELECT
  booking_date,
  COUNT(*) as num_bookings,
  array_agg(status) as statuses
FROM bookings
GROUP BY booking_date
ORDER BY booking_date DESC
LIMIT 10;
