-- DEBUG: Run the exact query the staff dashboard uses
-- This mimics what happens in app/staff/dashboard/page.tsx line 107-111

-- Step 1: Get bookings for today with dog_ids
SELECT
  id,
  booking_date,
  dog_id,
  dog_ids,
  total_dogs,
  status
FROM bookings
WHERE booking_date = '2025-10-07'
  AND status = 'confirmed';

-- Step 2: Extract all dog IDs from the dog_ids arrays
SELECT
  b.id as booking_id,
  b.booking_date,
  unnest(b.dog_ids) as dog_id
FROM bookings b
WHERE b.booking_date = '2025-10-07'
  AND b.status = 'confirmed';

-- Step 3: Count total dogs
SELECT
  COUNT(DISTINCT unnest(dog_ids)) as total_dogs_today
FROM bookings
WHERE booking_date = '2025-10-07'
  AND status = 'confirmed';

-- Step 4: Check if dog_ids is NULL or empty array
SELECT
  id,
  booking_date,
  dog_ids,
  dog_ids IS NULL as is_null,
  dog_ids = '{}' as is_empty,
  array_length(dog_ids, 1) as array_length
FROM bookings
WHERE booking_date = '2025-10-07'
LIMIT 10;
