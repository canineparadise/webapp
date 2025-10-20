-- FIX BOOKINGS: Populate dog_ids array from dog_id column
-- The staff dashboard expects dog_ids to be an array, but we only populated dog_id (singular)

UPDATE bookings
SET dog_ids = ARRAY[dog_id]
WHERE dog_id IS NOT NULL
  AND (dog_ids IS NULL OR dog_ids = '{}');

-- Verify the fix
SELECT
  id,
  booking_date,
  dog_id,
  dog_ids,
  status,
  session_type
FROM bookings
WHERE booking_date >= '2025-10-07'
ORDER BY booking_date
LIMIT 10;
