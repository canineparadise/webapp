-- =====================================================
-- BOOK ASSESSMENT FOR JENNA
-- =====================================================
-- User: jennadebeer1989@icloud.com
-- ID: d6c76daa-09bd-4b15-9972-966441f647b6
-- Assessment: Monday, 20 October 2025 at 09:00-12:00
-- =====================================================

-- First, let's see what dogs belong to this user
SELECT 'YOUR DOGS:' AS info;
SELECT id, name, breed, is_approved
FROM dogs
WHERE owner_id = 'd6c76daa-09bd-4b15-9972-966441f647b6'
ORDER BY created_at;

-- Check if there are any existing assessment bookings
SELECT 'EXISTING ASSESSMENT BOOKINGS:' AS info;
SELECT *
FROM assessment_bookings
WHERE user_id = 'd6c76daa-09bd-4b15-9972-966441f647b6';

-- Now create the assessment booking
-- Note: You'll need to replace DOG_ID_HERE with actual dog IDs from the query above
INSERT INTO assessment_bookings (
  user_id,
  dog_id,
  assessment_date,
  assessment_time,
  time_slot,
  status,
  payment_status,
  amount_paid,
  notes,
  created_at
)
VALUES (
  'd6c76daa-09bd-4b15-9972-966441f647b6',
  'DOG_ID_HERE', -- Replace with actual dog ID from the query above
  '2025-10-20',
  '09:00',
  '09:00-12:00',
  'confirmed',
  'paid',
  40.00,
  'Assessment booked via SQL script',
  NOW()
);

-- If you have multiple dogs, add more INSERT statements for each dog:
-- INSERT INTO assessment_bookings (user_id, dog_id, assessment_date, assessment_time, time_slot, status, payment_status, amount_paid, notes, created_at)
-- VALUES ('d6c76daa-09bd-4b15-9972-966441f647b6', 'SECOND_DOG_ID_HERE', '2025-10-20', '09:00', '09:00-12:00', 'confirmed', 'paid', 40.00, 'Assessment booked via SQL script', NOW());

-- Verify the booking was created
SELECT 'ASSESSMENT BOOKING CREATED:' AS info;
SELECT
  ab.id,
  ab.assessment_date,
  ab.assessment_time,
  ab.time_slot,
  ab.status,
  ab.payment_status,
  d.name as dog_name,
  d.breed,
  p.first_name || ' ' || p.last_name as owner_name,
  p.email
FROM assessment_bookings ab
JOIN dogs d ON d.id = ab.dog_id
JOIN profiles p ON p.id = ab.user_id
WHERE ab.user_id = 'd6c76daa-09bd-4b15-9972-966441f647b6'
ORDER BY ab.created_at DESC;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Assessment booking script ready!';
  RAISE NOTICE '📝 INSTRUCTIONS:';
  RAISE NOTICE '  1. Run the first SELECT to see your dogs';
  RAISE NOTICE '  2. Copy the dog ID(s) from the results';
  RAISE NOTICE '  3. Replace DOG_ID_HERE in the INSERT statement with your actual dog ID';
  RAISE NOTICE '  4. Run the INSERT statement to create the booking';
  RAISE NOTICE '  5. Run the final SELECT to verify the booking';
  RAISE NOTICE '';
  RAISE NOTICE '🗓️  Assessment: Monday, 20 October 2025 at 09:00-12:00';
END $$;
