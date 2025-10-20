-- URGENT: Check if we have ANY data at all

-- 1. How many users/profiles?
SELECT COUNT(*) as total_profiles FROM profiles;

-- 2. How many dogs?
SELECT COUNT(*) as total_dogs FROM dogs;

-- 3. How many bookings?
SELECT COUNT(*) as total_bookings FROM bookings;

-- 4. Check if dogs are APPROVED (staff portal only shows approved dogs)
SELECT
  is_approved,
  assessment_completed,
  COUNT(*) as num_dogs
FROM dogs
GROUP BY is_approved, assessment_completed;

-- 5. Check if profiles are APPROVED (only approved users can book)
SELECT
  approval_status,
  COUNT(*) as num_profiles
FROM profiles
GROUP BY approval_status;

-- 6. Check a sample dog with its owner
SELECT
  d.id as dog_id,
  d.name as dog_name,
  d.is_approved,
  d.assessment_completed,
  p.id as owner_id,
  p.first_name,
  p.last_name,
  p.approval_status
FROM dogs d
JOIN profiles p ON d.owner_id = p.id
LIMIT 5;
