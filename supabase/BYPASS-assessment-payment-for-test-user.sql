-- Bypass assessment payment and create confirmed assessment booking for test user
-- This simulates a successful payment and confirmed assessment booking

-- STEP 1: Find your user ID (replace the email with yours)
-- SELECT id, email, first_name, last_name FROM profiles WHERE email = 'your-email@example.com';

-- STEP 2: Find an available slot
-- SELECT id, assessment_date, start_time, end_time FROM assessment_slots
-- WHERE is_available = true AND booked_count < max_dogs
-- ORDER BY assessment_date, start_time LIMIT 5;

-- STEP 3: Replace these variables with your actual values
DO $$
DECLARE
  v_user_id UUID;
  v_slot_id UUID;
  v_assessment_date DATE;
  v_start_time TIME;
  v_end_time TIME;
  v_dog_ids UUID[];
BEGIN
  -- REPLACE THIS EMAIL WITH YOUR ACTUAL EMAIL
  SELECT id INTO v_user_id
  FROM profiles
  WHERE email = 'jenna@canine.com' -- <<<< CHANGE THIS TO YOUR EMAIL
  LIMIT 1;

  -- Get first available slot
  SELECT id, assessment_date, start_time, end_time
  INTO v_slot_id, v_assessment_date, v_start_time, v_end_time
  FROM assessment_slots
  WHERE is_available = true
    AND booked_count < max_dogs
  ORDER BY assessment_date, start_time
  LIMIT 1;

  -- Get all dog IDs for this user
  SELECT ARRAY_AGG(id) INTO v_dog_ids
  FROM dogs
  WHERE owner_id = v_user_id;

  -- Create assessment booking record
  INSERT INTO assessment_bookings (
    user_id,
    slot_id,
    dog_ids,
    status,
    payment_status,
    payment_amount,
    stripe_payment_intent_id,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_slot_id,
    v_dog_ids,
    'confirmed',
    'paid',
    4000, -- £40.00 in pence
    'test_payment_bypass_' || gen_random_uuid(),
    NOW(),
    NOW()
  );

  -- Update slot booked count
  UPDATE assessment_slots
  SET booked_count = booked_count + 1
  WHERE id = v_slot_id;

  -- Create assessment_schedule record (for compatibility)
  INSERT INTO assessment_schedule (
    user_id,
    requested_date,
    confirmed_date,
    status,
    payment_status,
    dog_ids,
    notes,
    created_at
  ) VALUES (
    v_user_id,
    v_assessment_date,
    v_assessment_date,
    'confirmed',
    'paid',
    v_dog_ids,
    'Test booking - payment bypassed',
    NOW()
  );

  -- Output confirmation
  RAISE NOTICE 'Assessment booked successfully!';
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Slot ID: %', v_slot_id;
  RAISE NOTICE 'Assessment Date: % at % - %', v_assessment_date, v_start_time, v_end_time;
  RAISE NOTICE 'Dogs: % dog(s)', array_length(v_dog_ids, 1);
END $$;

-- Verify the booking
SELECT
  ab.id as booking_id,
  p.email,
  p.first_name,
  p.last_name,
  s.assessment_date,
  s.start_time,
  s.end_time,
  ab.status,
  ab.payment_status,
  array_length(ab.dog_ids, 1) as num_dogs
FROM assessment_bookings ab
JOIN profiles p ON ab.user_id = p.id
JOIN assessment_slots s ON ab.slot_id = s.id
WHERE p.email = 'jenna@canine.com' -- <<<< CHANGE THIS TO YOUR EMAIL
ORDER BY ab.created_at DESC
LIMIT 1;
