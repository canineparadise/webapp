-- URGENT: Check if bookings exist RIGHT NOW

-- 1. How many bookings total?
SELECT COUNT(*) as total_bookings FROM bookings;

-- 2. Show me ALL bookings with their dates and dog_ids
SELECT
  id,
  booking_date,
  status,
  dog_ids,
  array_length(dog_ids, 1) as num_dogs_in_array,
  dog_id
FROM bookings
ORDER BY booking_date;

-- 3. Check if dog_ids is actually populated
SELECT
  COUNT(*) as total_bookings,
  COUNT(CASE WHEN dog_ids IS NOT NULL AND dog_ids != '{}' THEN 1 END) as bookings_with_dog_ids,
  COUNT(CASE WHEN dog_ids IS NULL OR dog_ids = '{}' THEN 1 END) as bookings_without_dog_ids
FROM bookings;
