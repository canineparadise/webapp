-- Check if dog_ids arrays are actually populated
SELECT
  id,
  booking_date,
  dog_ids,
  CASE
    WHEN dog_ids IS NULL THEN 'NULL'
    WHEN dog_ids = '{}' THEN 'EMPTY ARRAY'
    ELSE 'HAS DATA'
  END as dog_ids_status,
  array_length(dog_ids, 1) as array_length,
  status
FROM bookings
WHERE booking_date = '2025-10-07'
  AND status = 'confirmed'
ORDER BY id
LIMIT 16;
