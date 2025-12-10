-- ============================================
-- DEBUG ASSESSMENT BOOKINGS AND PENDING DOGS
-- ============================================

-- 1. Check all assessment bookings
SELECT
  ab.id,
  ab.booking_status,
  ab.booked_at,
  ab.slot_id,
  ab.dog_id,
  ab.user_id,
  s.assessment_date,
  s.start_time,
  s.end_time,
  d.name as dog_name,
  p.first_name || ' ' || p.last_name as owner_name
FROM assessment_bookings ab
LEFT JOIN assessment_slots s ON ab.slot_id = s.id
LEFT JOIN dogs d ON ab.dog_id = d.id
LEFT JOIN profiles p ON ab.user_id = p.id
ORDER BY ab.booked_at DESC;

-- 2. Check assessment slots for Dec 19th
SELECT * FROM assessment_slots
WHERE assessment_date = '2024-12-19'
ORDER BY start_time;

-- 3. Check dogs with assessment_completed = true but is_approved = false
SELECT
  d.id,
  d.name,
  d.assessment_completed,
  d.is_approved,
  d.assessment_date,
  p.first_name || ' ' || p.last_name as owner_name
FROM dogs d
LEFT JOIN profiles p ON d.owner_id = p.id
WHERE d.assessment_completed = true AND d.is_approved = false;

-- 4. Check profiles approval status
SELECT
  id,
  first_name,
  last_name,
  email,
  approval_status
FROM profiles
WHERE role = 'user'
ORDER BY created_at DESC
LIMIT 20;

-- 5. Count assessment bookings by status
SELECT booking_status, COUNT(*) as count
FROM assessment_bookings
GROUP BY booking_status;
