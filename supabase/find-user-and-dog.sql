-- Find the user with ID from Stripe webhook
SELECT
  id,
  email,
  first_name,
  last_name,
  created_at
FROM profiles
WHERE id = 'c5e76355-e017-4492-80b5-40ad9a93e379';

-- Find the dog with ID from Stripe webhook
SELECT
  id,
  name,
  breed,
  owner_id,
  is_approved,
  is_draft,
  created_at
FROM dogs
WHERE id = '232f26bb-1601-435a-a577-1250cdef3c1b';

-- Check if this dog belongs to this user
SELECT
  d.id AS dog_id,
  d.name AS dog_name,
  d.owner_id,
  p.email AS owner_email,
  p.first_name,
  p.last_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
WHERE d.id = '232f26bb-1601-435a-a577-1250cdef3c1b';

-- Find ALL users with email andrew_carrick@yahoo.co.uk
SELECT
  id,
  email,
  first_name,
  last_name,
  created_at
FROM profiles
WHERE email = 'andrew_carrick@yahoo.co.uk';

-- Find ALL dogs named Azlan
SELECT
  d.id,
  d.name,
  d.owner_id,
  p.email AS owner_email,
  d.is_approved,
  d.is_draft
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
WHERE d.name = 'Azlan';
