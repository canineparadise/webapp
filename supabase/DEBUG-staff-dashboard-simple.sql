-- Simple debug: Check bookings for 2025-10-07

-- Step 1: Check all bookings for today
SELECT
  id,
  booking_date,
  dog_ids,
  array_length(dog_ids, 1) as num_dogs,
  status
FROM bookings
WHERE booking_date = '2025-10-07'
  AND status = 'confirmed'
ORDER BY id;

-- Step 2: Total count
SELECT COUNT(*) as total_bookings
FROM bookings
WHERE booking_date = '2025-10-07'
  AND status = 'confirmed';
