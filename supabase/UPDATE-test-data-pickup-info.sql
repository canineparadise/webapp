-- Update test dogs with authorized pickup/dropoff people and passwords
-- This gives realistic test data for the check-in/check-out system

-- Update dogs with authorized people and checkout passwords
UPDATE dogs SET
  authorized_dropoff_people = ARRAY['Owner', 'Partner'],
  authorized_pickup_people = ARRAY['Owner', 'Partner'],
  checkout_password = name || ' is king'
WHERE id IN (
  SELECT id FROM dogs LIMIT 5
);

UPDATE dogs SET
  authorized_dropoff_people = ARRAY['Mom', 'Dad', 'Sister'],
  authorized_pickup_people = ARRAY['Mom', 'Dad'],
  checkout_password = 'family123'
WHERE id IN (
  SELECT id FROM dogs OFFSET 5 LIMIT 5
);

UPDATE dogs SET
  authorized_dropoff_people = ARRAY['Emma', 'Ethan'],
  authorized_pickup_people = ARRAY['Emma', 'Ethan'],
  checkout_password = name || ' rules'
WHERE id IN (
  SELECT id FROM dogs OFFSET 10 LIMIT 5
);

UPDATE dogs SET
  authorized_dropoff_people = ARRAY['Sarah'],
  authorized_pickup_people = ARRAY['Sarah', 'Dog Walker'],
  checkout_password = 'walkies'
WHERE id IN (
  SELECT id FROM dogs OFFSET 15 LIMIT 5
);

UPDATE dogs SET
  authorized_dropoff_people = ARRAY['John', 'Jane'],
  authorized_pickup_people = ARRAY['John', 'Jane', 'Neighbor'],
  checkout_password = 'woof123'
WHERE id IN (
  SELECT id FROM dogs OFFSET 20 LIMIT 5
);

-- Update remaining dogs with default values
UPDATE dogs SET
  authorized_dropoff_people = ARRAY['Owner'],
  authorized_pickup_people = ARRAY['Owner'],
  checkout_password = 'pickup123'
WHERE authorized_dropoff_people IS NULL OR authorized_dropoff_people = '{}';

-- Verify the updates
SELECT
  name,
  authorized_dropoff_people,
  authorized_pickup_people,
  checkout_password
FROM dogs
ORDER BY name
LIMIT 10;
