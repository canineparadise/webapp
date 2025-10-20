-- ADD dog_ids array column to bookings table
-- The staff dashboard expects bookings to have a dog_ids UUID array

-- Add the column
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS dog_ids UUID[] DEFAULT '{}';

-- Populate existing bookings with their dog_id as an array
UPDATE bookings
SET dog_ids = ARRAY[dog_id]
WHERE dog_id IS NOT NULL AND dog_ids = '{}';

-- Add total_dogs column (calculated from array length)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS total_dogs INTEGER DEFAULT 1;

-- Update total_dogs based on dog_ids array length
UPDATE bookings
SET total_dogs = array_length(dog_ids, 1)
WHERE dog_ids IS NOT NULL AND dog_ids != '{}';

-- Verify the changes
SELECT
  id,
  booking_date,
  dog_id,
  dog_ids,
  total_dogs,
  status,
  session_type
FROM bookings
WHERE booking_date >= '2025-10-07'
ORDER BY booking_date
LIMIT 10;
