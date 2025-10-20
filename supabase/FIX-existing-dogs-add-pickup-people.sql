-- Fix existing dogs that don't have authorized pickup/dropoff people
-- This adds default values so check-in/check-out works immediately

UPDATE dogs SET
  authorized_dropoff_people = ARRAY['Owner', 'Partner', 'Family Member'],
  authorized_pickup_people = ARRAY['Owner', 'Partner', 'Family Member'],
  checkout_password = LOWER(name || '123')
WHERE authorized_dropoff_people IS NULL
   OR authorized_dropoff_people = '{}'
   OR array_length(authorized_dropoff_people, 1) IS NULL;

-- Verify the update
SELECT
  name,
  authorized_dropoff_people,
  authorized_pickup_people,
  checkout_password
FROM dogs
ORDER BY name
LIMIT 10;
