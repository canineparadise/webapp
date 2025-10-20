-- =====================================================
-- BOOK ASSESSMENT FOR JENNA - FIXED
-- =====================================================
-- User: jennadebeer1989@icloud.com
-- ID: d6c76daa-09bd-4b15-9972-966441f647b6
-- Assessment: Monday, 20 October 2025 at 09:00-12:00
-- =====================================================

-- Step 1: Check your dogs
SELECT 'YOUR DOGS:' AS info;
SELECT id, name, breed, is_approved
FROM dogs
WHERE owner_id = 'd6c76daa-09bd-4b15-9972-966441f647b6'
ORDER BY created_at;

-- Step 2: Check if assessment slot exists for that date/time
SELECT 'CHECKING FOR ASSESSMENT SLOT:' AS info;
SELECT id, assessment_date, start_time, end_time, max_capacity, current_bookings, is_available
FROM assessment_slots
WHERE assessment_date = '2025-10-20'
  AND start_time = '09:00'
ORDER BY start_time;

-- Step 3: Create the assessment slot if it doesn't exist
INSERT INTO assessment_slots (
  assessment_date,
  start_time,
  end_time,
  max_capacity,
  current_bookings,
  is_available
)
VALUES (
  '2025-10-20',
  '09:00',
  '12:00',
  6, -- max capacity
  0, -- no bookings yet
  true
)
ON CONFLICT DO NOTHING
RETURNING id, assessment_date, start_time, end_time;

-- Step 4: Get the slot ID (run this after creating the slot)
SELECT 'SLOT ID TO USE:' AS info;
SELECT id as slot_id, assessment_date, start_time, end_time
FROM assessment_slots
WHERE assessment_date = '2025-10-20'
  AND start_time = '09:00';

-- Step 5: Create the assessment booking
-- Replace SLOT_ID_HERE and DOG_ID_HERE with actual IDs from queries above
INSERT INTO assessment_bookings (
  slot_id,
  dog_id,
  user_id,
  booking_status,
  booked_at
)
VALUES (
  'SLOT_ID_HERE', -- Replace with slot_id from Step 4
  'DOG_ID_HERE',  -- Replace with dog id from Step 1
  'd6c76daa-09bd-4b15-9972-966441f647b6',
  'confirmed',
  NOW()
);

-- Step 6: Update the slot's current_bookings count
UPDATE assessment_slots
SET current_bookings = current_bookings + 1
WHERE id = 'SLOT_ID_HERE'; -- Replace with same slot_id

-- Step 7: Update the dog to mark assessment as scheduled
UPDATE dogs
SET assessment_slot_id = 'SLOT_ID_HERE' -- Replace with same slot_id
WHERE id = 'DOG_ID_HERE'; -- Replace with same dog_id

-- Step 8: Verify the booking was created
SELECT 'ASSESSMENT BOOKING CREATED:' AS info;
SELECT
  ab.id,
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

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Assessment booking script ready!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 FOLLOW THESE STEPS IN ORDER:';
  RAISE NOTICE '  1. Run Step 1 to see your dogs - copy a dog ID';
  RAISE NOTICE '  2. Run Step 2 to check if slot exists';
  RAISE NOTICE '  3. Run Step 3 to create the slot if needed';
  RAISE NOTICE '  4. Run Step 4 to get the slot_id - copy it';
  RAISE NOTICE '  5. In Step 5, replace SLOT_ID_HERE and DOG_ID_HERE with actual IDs';
  RAISE NOTICE '  6. Run Step 5 to create the booking';
  RAISE NOTICE '  7. Run Step 6 to update booking count (use same IDs)';
  RAISE NOTICE '  8. Run Step 7 to update the dog record (use same IDs)';
  RAISE NOTICE '  9. Run Step 8 to verify everything worked';
  RAISE NOTICE '';
  RAISE NOTICE '🗓️  Assessment: Monday, 20 October 2025 at 09:00-12:00';
END $$;
