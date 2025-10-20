-- Check all assessment-related data
SELECT 'ASSESSMENT BOOKINGS:' AS info;
SELECT
  ab.id,
  ab.booking_status,
  ab.booked_at,
  s.assessment_date,
  s.start_time,
  s.end_time,
  d.name as dog_name,
  d.breed,
  p.first_name || ' ' || p.last_name as owner_name,
  p.email,
  p.phone
FROM assessment_bookings ab
JOIN assessment_slots s ON s.id = ab.slot_id
JOIN dogs d ON d.id = ab.dog_id
JOIN profiles p ON p.id = ab.user_id
ORDER BY s.assessment_date, s.start_time;

SELECT 'DOGS WITH ASSESSMENT_SLOT_ID:' AS info;
SELECT
  d.id,
  d.name,
  d.breed,
  d.assessment_slot_id,
  d.assessment_date,
  d.assessment_completed,
  p.first_name || ' ' || p.last_name as owner_name,
  p.email
FROM dogs d
JOIN profiles p ON p.id = d.owner_id
WHERE d.assessment_slot_id IS NOT NULL
ORDER BY d.created_at;

SELECT 'ALL ASSESSMENT SLOTS:' AS info;
SELECT
  id,
  assessment_date,
  start_time,
  end_time,
  max_dogs,
  booked_count,
  is_available
FROM assessment_slots
ORDER BY assessment_date, start_time;
