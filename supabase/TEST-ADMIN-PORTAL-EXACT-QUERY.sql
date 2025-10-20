-- Run the EXACT queries the admin portal runs

-- 1. Total dogs (should be 32+)
SELECT COUNT(*) as total_dogs FROM dogs;

-- 2. Total users with role='user' (should be 21)
SELECT COUNT(*) as total_users FROM profiles WHERE role = 'user';

-- 3. Today's bookings with dog_ids (THIS IS THE KEY ONE)
SELECT
  id,
  booking_date,
  dog_ids,
  array_length(dog_ids, 1) as num_dogs_in_array,
  status,
  user_id
FROM bookings
WHERE booking_date = CURRENT_DATE
  AND status = 'confirmed';

-- 4. Try to fetch dogs using dog_ids from bookings
-- This mimics what the admin portal does in lines 264-273
WITH todays_bookings AS (
  SELECT
    id as booking_id,
    dog_ids,
    user_id
  FROM bookings
  WHERE booking_date = CURRENT_DATE
    AND status = 'confirmed'
)
SELECT
  tb.booking_id,
  tb.user_id,
  unnest(tb.dog_ids) as dog_id_from_array,
  d.id as actual_dog_id,
  d.name as dog_name
FROM todays_bookings tb
LEFT JOIN dogs d ON d.id = ANY(tb.dog_ids)
LIMIT 20;
