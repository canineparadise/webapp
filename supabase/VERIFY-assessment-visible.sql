-- Verify the assessment booking is visible with the exact query the staff dashboard uses
SELECT 'ASSESSMENT BOOKINGS (what staff should see):' AS info;
SELECT
  ab.id as booking_id,
  ab.booking_status,
  ab.booked_at,
  s.id as slot_id,
  s.assessment_date,
  s.start_time,
  s.end_time,
  d.id as dog_id,
  d.name as dog_name,
  d.breed,
  p.first_name,
  p.last_name,
  p.phone,
  p.email
FROM assessment_bookings ab
JOIN assessment_slots s ON s.id = ab.slot_id
JOIN dogs d ON d.id = ab.dog_id
JOIN profiles p ON p.id = ab.user_id
WHERE s.assessment_date >= CURRENT_DATE
  AND ab.booking_status = 'confirmed'
ORDER BY s.assessment_date, s.start_time;

-- Also check what's in the assessment_slots table
SELECT 'ASSESSMENT SLOTS:' AS info;
SELECT * FROM assessment_slots
WHERE assessment_date >= CURRENT_DATE
ORDER BY assessment_date, start_time;

-- Check the specific booking we created
SELECT 'JENNA SPECIFIC BOOKING:' AS info;
SELECT
  ab.*,
  s.assessment_date,
  s.start_time,
  d.name as dog_name
FROM assessment_bookings ab
JOIN assessment_slots s ON s.id = ab.slot_id
JOIN dogs d ON d.id = ab.dog_id
WHERE ab.user_id = '42389796-b6d7-4167-b1c0-fec274c0f2c9';
