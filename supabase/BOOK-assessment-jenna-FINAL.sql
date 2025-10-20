-- =====================================================
-- BOOK ASSESSMENT FOR JENNA - FINAL
-- =====================================================
-- Slot ID: 8c3c5e13-031b-4b71-b77e-dcf1e54c9027
-- Assessment: Monday, 20 October 2025 at 09:00-12:00
-- =====================================================

-- First, get your dog ID
SELECT 'YOUR DOGS - COPY A DOG ID:' AS info;
SELECT id, name, breed, is_approved
FROM dogs
WHERE owner_id = 'd6c76daa-09bd-4b15-9972-966441f647b6'
ORDER BY created_at;

-- Now replace DOG_ID_HERE below with the dog ID from above, then run the rest:

-- Create the assessment booking
INSERT INTO assessment_bookings (
  slot_id,
  dog_id,
  user_id,
  booking_status,
  booked_at
)
VALUES (
  '8c3c5e13-031b-4b71-b77e-dcf1e54c9027',
  'DOG_ID_HERE',  -- Replace with your dog id from the query above
  'd6c76daa-09bd-4b15-9972-966441f647b6',
  'confirmed',
  NOW()
);

-- Update the slot's booked_count
UPDATE assessment_slots
SET booked_count = booked_count + 1
WHERE id = '8c3c5e13-031b-4b71-b77e-dcf1e54c9027';

-- Update the dog to mark assessment as scheduled
UPDATE dogs
SET assessment_slot_id = '8c3c5e13-031b-4b71-b77e-dcf1e54c9027'
WHERE id = 'DOG_ID_HERE'; -- Replace with same dog id

-- Verify the booking was created
SELECT 'ASSESSMENT BOOKING CREATED ✅' AS info;
SELECT
  ab.id as booking_id,
  s.assessment_date,
  s.start_time,
  s.end_time,
  ab.booking_status,
  d.name as dog_name,
  d.breed,
  p.first_name || ' ' || p.last_name as owner_name,
  p.email
FROM assessment_bookings ab
JOIN assessment_slots s ON s.id = ab.slot_id
JOIN dogs d ON d.id = ab.dog_id
JOIN profiles p ON p.id = ab.user_id
WHERE ab.user_id = 'd6c76daa-09bd-4b15-9972-966441f647b6'
ORDER BY ab.booked_at DESC;

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ Assessment booked successfully!';
  RAISE NOTICE '🗓️  Monday, 20 October 2025';
  RAISE NOTICE '🕘  09:00-12:00';
  RAISE NOTICE '📧  jennadebeer1989@icloud.com';
END $$;
